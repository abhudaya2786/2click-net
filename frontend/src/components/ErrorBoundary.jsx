import { Component } from "react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md text-center space-y-4">
            <h1 className="font-display font-extrabold text-2xl">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              This page failed to load. Check that <code className="text-xs">REACT_APP_BACKEND_URL</code> points to a live API, then refresh.
            </p>
            <p className="text-xs text-muted-foreground break-all">{String(this.state.error?.message || this.state.error)}</p>
            <Button className="rounded-none" onClick={() => window.location.assign("/")}>Go to Home</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
