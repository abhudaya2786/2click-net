import {
  VoiceCommandItem,
  VoiceCommandAction,
  VoiceCommandExecutionEvent,
} from '../types';
import { normalizeVoiceText } from './wakeWordProvider';

export type VoiceCommandListener = (event: VoiceCommandExecutionEvent) => void;
export type ActionExecutionHandler = (action: VoiceCommandAction, event: VoiceCommandExecutionEvent) => void;

export class VoiceCommandProvider {
  private commands: VoiceCommandItem[] = [];
  private isEnabled: boolean = true;
  private commandListeners: Set<VoiceCommandListener> = new Set();
  private actionHandlers: Map<VoiceCommandAction, Set<ActionExecutionHandler>> = new Map();
  private lastExecutedTime: number = 0;
  private executionCooldownMs: number = 1500;

  constructor(initialCommands: VoiceCommandItem[] = [], enabled: boolean = true) {
    this.commands = [...initialCommands];
    this.isEnabled = enabled;
  }

  // -------------------------------------------------------------
  // Command Registry Management
  // -------------------------------------------------------------

  public setCommands(commands: VoiceCommandItem[]) {
    this.commands = [...commands];
  }

  public getCommands(): VoiceCommandItem[] {
    return [...this.commands];
  }

  public addCommand(command: Omit<VoiceCommandItem, 'id' | 'executionCount'>): VoiceCommandItem {
    const newItem: VoiceCommandItem = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      executionCount: 0,
      ...command,
    };
    this.commands.push(newItem);
    return newItem;
  }

  public updateCommand(id: string, updates: Partial<VoiceCommandItem>): boolean {
    const idx = this.commands.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.commands[idx] = { ...this.commands[idx], ...updates };
    return true;
  }

  public deleteCommand(id: string): boolean {
    const initialLen = this.commands.length;
    this.commands = this.commands.filter((c) => c.id !== id);
    return this.commands.length < initialLen;
  }

  public toggleCommand(id: string, enabled?: boolean): boolean {
    const item = this.commands.find((c) => c.id === id);
    if (!item) return false;
    item.enabled = enabled !== undefined ? enabled : !item.enabled;
    return true;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // -------------------------------------------------------------
  // Match & Execution Engine
  // -------------------------------------------------------------

  public findMatchingCommand(rawTranscript: string): VoiceCommandItem | null {
    if (!this.isEnabled) return null;
    const normalized = normalizeVoiceText(rawTranscript);
    if (!normalized) return null;

    for (const cmd of this.commands) {
      if (!cmd.enabled) continue;

      const candidatePhrases = [
        normalizeVoiceText(cmd.phrase),
        ...(cmd.aliases || []).map(normalizeVoiceText),
      ].filter(Boolean);

      for (const phrase of candidatePhrases) {
        if (!phrase) continue;

        const isExactOrContains =
          normalized === phrase ||
          normalized.startsWith(`${phrase} `) ||
          normalized.endsWith(` ${phrase}`) ||
          normalized.includes(` ${phrase} `) ||
          (phrase.length >= 5 && normalized.includes(phrase));

        if (isExactOrContains) {
          return cmd;
        }
      }
    }

    return null;
  }

  public processTranscript(
    rawTranscript: string,
    opts: { executeHandlers?: boolean } = {},
  ): VoiceCommandExecutionEvent | null {
    if (!this.isEnabled) return null;

    const now = Date.now();
    if (now - this.lastExecutedTime < this.executionCooldownMs) {
      return null;
    }

    const matchedCmd = this.findMatchingCommand(rawTranscript);
    if (!matchedCmd) return null;

    this.lastExecutedTime = now;
    matchedCmd.executionCount = (matchedCmd.executionCount || 0) + 1;
    matchedCmd.lastExecutedAt = new Date().toISOString();

    const event: VoiceCommandExecutionEvent = {
      command: matchedCmd,
      action: matchedCmd.action,
      rawTranscript,
      timestamp: new Date().toISOString(),
    };

    // Notify listeners & handlers
    this.commandListeners.forEach((fn) => fn(event));

    if (opts.executeHandlers !== false) {
      const handlers = this.actionHandlers.get(matchedCmd.action);
      if (handlers) {
        handlers.forEach((h) => h(matchedCmd.action, event));
      }
    }

    return event;
  }

  // -------------------------------------------------------------
  // Handlers & Event Subscription
  // -------------------------------------------------------------

  public onCommandExecuted(listener: VoiceCommandListener): () => void {
    this.commandListeners.add(listener);
    return () => this.commandListeners.delete(listener);
  }

  public registerActionHandler(action: VoiceCommandAction, handler: ActionExecutionHandler): () => void {
    if (!this.actionHandlers.has(action)) {
      this.actionHandlers.set(action, new Set());
    }
    this.actionHandlers.get(action)!.add(handler);

    return () => {
      this.actionHandlers.get(action)?.delete(handler);
    };
  }

  public manuallyTriggerAction(action: VoiceCommandAction, description: string = 'Manual trigger'): VoiceCommandExecutionEvent {
    const dummyCmd: VoiceCommandItem = {
      id: 'manual',
      phrase: description,
      aliases: [],
      action,
      language: 'multilingual',
      enabled: true,
      executionCount: 1,
    };

    const event: VoiceCommandExecutionEvent = {
      command: dummyCmd,
      action,
      rawTranscript: description,
      timestamp: new Date().toISOString(),
    };

    this.commandListeners.forEach((fn) => fn(event));
    this.actionHandlers.get(action)?.forEach((h) => h(action, event));
    return event;
  }

  public destroy() {
    this.commandListeners.clear();
    this.actionHandlers.clear();
  }
}
