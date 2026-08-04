import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Filter,
  Building2,
  Users,
  TrendingUp,
  Download,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Zap,
  Layers,
  Flag,
  BarChart2,
  CheckSquare,
  AlertTriangle,
  Plus,
  X,
  Package,
  Truck,
  Edit3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { Project, User, CustomCostItem } from '../types';
import { logAnalyticsEvent } from '../lib/firebase';

interface ProjectGanttTimelineViewProps {
  currentUser?: User | null;
  selectedCity?: string;
  projects?: Project[];
  boqItems?: CustomCostItem[];
}

export interface MilestoneTask {
  id: string;
  taskName: string;
  category: 'Civil & Foundation' | 'MEP & Solar' | 'Finishes & Interiors' | 'Approvals & Inspection';
  startDay: number; // Day offset from project start
  endDay: number;
  startDate: string;
  dueDate: string;
  actualFinishDate?: string;
  progressPercent: number;
  assignedTo: string;
  dependencies: string;
  isCriticalPath: boolean;
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Delayed';
  isBoqMaterial?: boolean;
  materialBrand?: string;
  materialCostINR?: number;
}

interface ProjectTimelineData {
  id: string;
  projectName: string;
  city: string;
  startDate: string;
  targetCompletionDate: string;
  totalDurationDays: number;
  currentDayOffset: number; // Today's day index in timeline
  overallProgress: number;
  status: 'On Schedule' | 'Minor Delay' | 'Ahead of Schedule';
  milestones: MilestoneTask[];
}

// Mock Construction Projects Timeline Data
const SAMPLE_GANTT_PROJECTS: ProjectTimelineData[] = [
  {
    id: 'PRJ-GKP-101',
    projectName: 'Gorakhpur Commercial Complex (30x50 ft RCC)',
    city: 'Gorakhpur',
    startDate: '2026-03-01',
    targetCompletionDate: '2026-09-15',
    totalDurationDays: 200,
    currentDayOffset: 155, // Today line
    overallProgress: 76,
    status: 'On Schedule',
    milestones: [
      {
        id: 'M1',
        taskName: 'Site Survey & LiDAR 3D Terrain Scanning',
        category: 'Approvals & Inspection',
        startDay: 0,
        endDay: 15,
        startDate: '2026-03-01',
        dueDate: '2026-03-15',
        actualFinishDate: '2026-03-14',
        progressPercent: 100,
        assignedTo: 'Er. Alok Sharma (LiDAR Specialist)',
        dependencies: 'None',
        isCriticalPath: true,
        status: 'Completed'
      },
      {
        id: 'M2',
        taskName: 'Municipal Map Sanction & Vastu Alignment',
        category: 'Approvals & Inspection',
        startDay: 10,
        endDay: 30,
        startDate: '2026-03-11',
        dueDate: '2026-03-31',
        actualFinishDate: '2026-03-29',
        progressPercent: 100,
        assignedTo: 'GDA Architect Cell',
        dependencies: 'M1',
        isCriticalPath: true,
        status: 'Completed'
      },
      {
        id: 'M3',
        taskName: 'Excavation & RCC Foundation Footing',
        category: 'Civil & Foundation',
        startDay: 25,
        endDay: 65,
        startDate: '2026-03-26',
        dueDate: '2026-05-05',
        actualFinishDate: '2026-05-03',
        progressPercent: 100,
        assignedTo: 'Gorakhpur Earthmovers & Steel',
        dependencies: 'M2',
        isCriticalPath: true,
        status: 'Completed'
      },
      {
        id: 'M4',
        taskName: 'Plinth Beam, Columns & Brickwork Masonry',
        category: 'Civil & Foundation',
        startDay: 60,
        endDay: 110,
        startDate: '2026-05-01',
        dueDate: '2026-06-20',
        actualFinishDate: '2026-06-18',
        progressPercent: 100,
        assignedTo: 'Tata Tiscon Contract Team',
        dependencies: 'M3',
        isCriticalPath: true,
        status: 'Completed'
      },
      {
        id: 'M5',
        taskName: 'RCC Roof Slab Casting & Curing',
        category: 'Civil & Foundation',
        startDay: 105,
        endDay: 145,
        startDate: '2026-06-15',
        dueDate: '2026-07-25',
        actualFinishDate: '2026-07-24',
        progressPercent: 100,
        assignedTo: 'UltraTech Concrete Masters',
        dependencies: 'M4',
        isCriticalPath: true,
        status: 'Completed'
      },
      {
        id: 'M6',
        taskName: 'Electrical Conduit & Plumbing Piping',
        category: 'MEP & Solar',
        startDay: 135,
        endDay: 170,
        startDate: '2026-07-15',
        dueDate: '2026-08-20',
        progressPercent: 70,
        assignedTo: 'Havells Certified MEP Contractors',
        dependencies: 'M5',
        isCriticalPath: false,
        status: 'In Progress'
      },
      {
        id: 'M7',
        taskName: 'PM Surya Ghar 10kW Rooftop Solar Installation',
        category: 'MEP & Solar',
        startDay: 150,
        endDay: 180,
        startDate: '2026-08-01',
        dueDate: '2026-08-30',
        progressPercent: 30,
        assignedTo: 'Waaree Solar Certified Installers',
        dependencies: 'M5',
        isCriticalPath: false,
        status: 'In Progress'
      },
      {
        id: 'M8',
        taskName: 'Vitrified Flooring & Wall Plastering',
        category: 'Finishes & Interiors',
        startDay: 160,
        endDay: 190,
        startDate: '2026-08-10',
        dueDate: '2026-09-08',
        progressPercent: 10,
        assignedTo: 'Kajaria Tile Masters',
        dependencies: 'M6',
        isCriticalPath: true,
        status: 'In Progress'
      },
      {
        id: 'M9',
        taskName: 'Modular Interior Fitouts & Paint Finishing',
        category: 'Finishes & Interiors',
        startDay: 175,
        endDay: 200,
        startDate: '2026-08-25',
        dueDate: '2026-09-15',
        progressPercent: 0,
        assignedTo: '2click Interior Studio Team',
        dependencies: 'M8',
        isCriticalPath: true,
        status: 'Scheduled'
      }
    ]
  },
  {
    id: 'PRJ-LKO-202',
    projectName: 'Lucknow Metro Solar Rooftop 500kW',
    city: 'Lucknow',
    startDate: '2026-02-01',
    targetCompletionDate: '2026-07-31',
    totalDurationDays: 180,
    currentDayOffset: 180,
    overallProgress: 94,
    status: 'Ahead of Schedule',
    milestones: [
      {
        id: 'LM1',
        taskName: 'Structural Load Audit & Shadow Analysis',
        category: 'Approvals & Inspection',
        startDay: 0,
        endDay: 20,
        startDate: '2026-02-01',
        dueDate: '2026-02-20',
        actualFinishDate: '2026-02-18',
        progressPercent: 100,
        assignedTo: 'UPNEDA Solar Inspection Cell',
        dependencies: 'None',
        isCriticalPath: true,
        status: 'Completed'
      },
      {
        id: 'LM2',
        taskName: 'Galvanized Steel Structure Mounting',
        category: 'Civil & Foundation',
        startDay: 15,
        endDay: 60,
        startDate: '2026-02-16',
        dueDate: '2026-03-31',
        actualFinishDate: '2026-03-28',
        progressPercent: 100,
        assignedTo: 'Tata Power Solar Erectors',
        dependencies: 'LM1',
        isCriticalPath: true,
        status: 'Completed'
      },
      {
        id: 'LM3',
        taskName: 'PV Module Stringing & Inverter Wiring',
        category: 'MEP & Solar',
        startDay: 50,
        endDay: 130,
        startDate: '2026-03-22',
        dueDate: '2026-06-10',
        actualFinishDate: '2026-06-05',
        progressPercent: 100,
        assignedTo: 'Waaree Solar EPC Engineers',
        dependencies: 'LM2',
        isCriticalPath: true,
        status: 'Completed'
      },
      {
        id: 'LM4',
        taskName: 'Net-Metering Grid Synchronization',
        category: 'MEP & Solar',
        startDay: 120,
        endDay: 180,
        startDate: '2026-06-01',
        dueDate: '2026-07-31',
        progressPercent: 85,
        assignedTo: 'MVVNL Discom Electrical Inspector',
        dependencies: 'LM3',
        isCriticalPath: true,
        status: 'In Progress'
      }
    ]
  },
  {
    id: 'PRJ-VNS-303',
    projectName: 'Varanasi Heritage Villa Interior & Vastu Refit',
    city: 'Varanasi',
    startDate: '2026-04-15',
    targetCompletionDate: '2026-09-30',
    totalDurationDays: 165,
    currentDayOffset: 110,
    overallProgress: 60,
    status: 'Minor Delay',
    milestones: [
      {
        id: 'VM1',
        taskName: 'Vastu Shastra Directional Audit & Demolition',
        category: 'Approvals & Inspection',
        startDay: 0,
        endDay: 25,
        startDate: '2026-04-15',
        dueDate: '2026-05-10',
        actualFinishDate: '2026-05-12',
        progressPercent: 100,
        assignedTo: 'Pt. Shastri Vastu Cell',
        dependencies: 'None',
        isCriticalPath: true,
        status: 'Completed'
      },
      {
        id: 'VM2',
        taskName: 'Italian Marble Flooring & Wall Paneling',
        category: 'Finishes & Interiors',
        startDay: 20,
        endDay: 80,
        startDate: '2026-05-05',
        dueDate: '2026-07-05',
        actualFinishDate: '2026-07-15',
        progressPercent: 100,
        assignedTo: 'Kajaria World Marble Team',
        dependencies: 'VM1',
        isCriticalPath: true,
        status: 'Completed'
      },
      {
        id: 'VM3',
        taskName: 'Custom Blum Hardware Kitchen & Modular Wardrobes',
        category: 'Finishes & Interiors',
        startDay: 75,
        endDay: 135,
        startDate: '2026-07-01',
        dueDate: '2026-08-30',
        progressPercent: 45,
        assignedTo: 'Blum Luxury Craftsmen',
        dependencies: 'VM2',
        isCriticalPath: true,
        status: 'Delayed'
      },
      {
        id: 'VM4',
        taskName: 'Smart Ambient Lighting & Automated Blinds',
        category: 'MEP & Solar',
        startDay: 120,
        endDay: 165,
        startDate: '2026-08-15',
        dueDate: '2026-09-30',
        progressPercent: 0,
        assignedTo: 'Schneider Home Automation',
        dependencies: 'VM3',
        isCriticalPath: false,
        status: 'Scheduled'
      }
    ]
  }
];

const CustomGanttTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const taskRange = data.taskRange || [data.startDay, data.endDay];
    const duration = taskRange[1] - taskRange[0];

    return (
      <div className="bg-slate-900/95 border border-slate-700 p-3.5 rounded-2xl shadow-2xl text-xs text-slate-100 backdrop-blur-md space-y-1.5 max-w-xs">
        <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 gap-2">
          <span className="font-bold text-teal-400">{data.taskName}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
            data.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
            data.status === 'In Progress' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
            data.status === 'Delayed' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
            'bg-slate-800 text-slate-300'
          }`}>
            {data.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div>
            <span className="text-slate-500 block text-[10px]">Category</span>
            <span className="font-semibold text-white">{data.category}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Duration</span>
            <span className="font-mono font-bold text-amber-300">{duration} Days</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Start Date</span>
            <span className="font-mono">{data.startDate}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Target Due</span>
            <span className="font-mono">{data.dueDate}</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400">Completion:</span>
            <span className="font-mono font-bold text-emerald-400">{data.progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${data.progressPercent}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 italic pt-0.5">Assigned: {data.assignedTo}</p>
        </div>
      </div>
    );
  }
  return null;
};

export const ProjectGanttTimelineView: React.FC<ProjectGanttTimelineViewProps> = ({
  currentUser,
  selectedCity = 'Gorakhpur',
  boqItems = []
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(SAMPLE_GANTT_PROJECTS[0].id);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewScope, setViewScope] = useState<'all' | 'milestones_only' | 'boq_orders_only'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New custom milestone input state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState<string>('');
  const [newMilestoneCategory, setNewMilestoneCategory] = useState<MilestoneTask['category']>('Civil & Foundation');
  const [newMilestoneStartDay, setNewMilestoneStartDay] = useState<number>(30);
  const [newMilestoneDurationDays, setNewMilestoneDurationDays] = useState<number>(15);
  const [newMilestoneAssignedTo, setNewMilestoneAssignedTo] = useState<string>('Site Engineer');
  const [newMilestoneIsCritical, setNewMilestoneIsCritical] = useState<boolean>(false);

  const activeProject = SAMPLE_GANTT_PROJECTS.find(p => p.id === selectedProjectId) || SAMPLE_GANTT_PROJECTS[0];

  // Store project milestone list in state so user can edit status & progress or add items
  const [milestonesStateMap, setMilestonesStateMap] = useState<{ [key: string]: MilestoneTask[] }>({
    [SAMPLE_GANTT_PROJECTS[0].id]: SAMPLE_GANTT_PROJECTS[0].milestones,
    [SAMPLE_GANTT_PROJECTS[1].id]: SAMPLE_GANTT_PROJECTS[1].milestones,
  });

  const baseMilestones = milestonesStateMap[activeProject.id] || activeProject.milestones;

  // Convert BOQ Items into dynamic material procurement milestones
  const boqMaterialMilestones: MilestoneTask[] = useMemo(() => {
    if (!boqItems || boqItems.length === 0) return [];

    return boqItems.map((item, idx) => {
      const isDone = item.orderStatus === 'Installed';
      const isInProgress = item.orderStatus === 'In Transit' || item.orderStatus === 'Site Delivered';
      const startDay = 15 + (idx * 12) % 100;
      const endDay = startDay + 18;

      let cat: MilestoneTask['category'] = 'Civil & Foundation';
      if (item.category.includes('Electrical') || item.category.includes('Plumbing') || item.category.includes('Solar') || item.category.includes('Water')) {
        cat = 'MEP & Solar';
      } else if (item.category.includes('Paint') || item.category.includes('Tile') || item.category.includes('Flooring') || item.category.includes('Interior') || item.category.includes('Doors')) {
        cat = 'Finishes & Interiors';
      }

      return {
        id: `BOQ-${item.id}`,
        taskName: `📦 ${item.title} (${item.brandName || 'Empanelled Supply'})`,
        category: cat,
        startDay,
        endDay,
        startDate: `2026-08-${((idx % 20) + 1).toString().padStart(2, '0')}`,
        dueDate: `2026-09-${(((idx + 8) % 25) + 1).toString().padStart(2, '0')}`,
        progressPercent: isDone ? 100 : isInProgress ? 60 : 15,
        assignedTo: `${item.brandName || 'Dukandar'} Logistics Cell`,
        dependencies: idx > 0 ? `BOQ-${boqItems[idx - 1].id}` : 'M1',
        isCriticalPath: item.totalCostINR > 100000,
        status: isDone ? 'Completed' : isInProgress ? 'In Progress' : 'Scheduled',
        isBoqMaterial: true,
        materialBrand: item.brandName,
        materialCostINR: item.totalCostINR
      };
    });
  }, [boqItems]);

  // Merge base milestones and BOQ material milestones based on viewScope
  const allCurrentMilestones = useMemo(() => {
    if (viewScope === 'milestones_only') return baseMilestones;
    if (viewScope === 'boq_orders_only') return boqMaterialMilestones;
    return [...baseMilestones, ...boqMaterialMilestones];
  }, [baseMilestones, boqMaterialMilestones, viewScope]);

  useEffect(() => {
    logAnalyticsEvent('gantt_project_progress_viewed', {
      project_id: activeProject.id,
      project_name: activeProject.projectName,
      overall_progress: activeProject.overallProgress,
      status: activeProject.status
    });
  }, [selectedProjectId]);

  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId);
    const proj = SAMPLE_GANTT_PROJECTS.find(p => p.id === projId);
    if (proj) {
      logAnalyticsEvent('gantt_project_selected', {
        project_id: proj.id,
        project_name: proj.projectName,
        overall_progress: proj.overallProgress
      });
    }
  };

  const handleCategoryFilter = (cat: string) => {
    setCategoryFilter(cat);
    logAnalyticsEvent('gantt_milestone_category_filtered', {
      category: cat,
      project_id: activeProject.id
    });
  };

  // Handler to update status of a milestone or material task
  const handleUpdateMilestoneStatus = (id: string, newStatus: MilestoneTask['status']) => {
    let newProgress = 0;
    if (newStatus === 'Completed') newProgress = 100;
    else if (newStatus === 'In Progress') newProgress = 50;
    else if (newStatus === 'Scheduled') newProgress = 10;
    else if (newStatus === 'Delayed') newProgress = 25;

    setMilestonesStateMap(prev => {
      const currentList = prev[activeProject.id] || activeProject.milestones;
      const updatedList = currentList.map(m => {
        if (m.id === id) {
          return { ...m, status: newStatus, progressPercent: newProgress };
        }
        return m;
      });
      return { ...prev, [activeProject.id]: updatedList };
    });
  };

  // Handler to add custom milestone
  const handleAddCustomMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const newId = `M-${Date.now().toString().slice(-4)}`;
    const endDay = newMilestoneStartDay + newMilestoneDurationDays;

    const newMilestone: MilestoneTask = {
      id: newId,
      taskName: newMilestoneTitle,
      category: newMilestoneCategory,
      startDay: newMilestoneStartDay,
      endDay,
      startDate: `2026-08-15`,
      dueDate: `2026-09-30`,
      progressPercent: 0,
      assignedTo: newMilestoneAssignedTo || 'Site Supervisor',
      dependencies: 'M1',
      isCriticalPath: newMilestoneIsCritical,
      status: 'Scheduled'
    };

    setMilestonesStateMap(prev => {
      const currentList = prev[activeProject.id] || activeProject.milestones;
      return { ...prev, [activeProject.id]: [...currentList, newMilestone] };
    });

    setNewMilestoneTitle('');
    setIsAddModalOpen(false);
  };

  // Filter Milestones for display
  const filteredMilestones = allCurrentMilestones.filter(m => {
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  // Prepare Recharts format for Gantt chart
  // Each task needs taskRange = [startDay, endDay]
  const ganttChartData = filteredMilestones.map(m => {
    let statusColor = '#3b82f6'; // In Progress
    if (m.status === 'Completed') statusColor = '#10b981';
    else if (m.status === 'Delayed') statusColor = '#ef4444';
    else if (m.status === 'Scheduled') statusColor = '#6366f1';

    return {
      id: m.id,
      taskName: m.taskName.length > 28 ? m.taskName.slice(0, 26) + '…' : m.taskName,
      fullTaskName: m.taskName,
      category: m.category,
      startDay: m.startDay,
      endDay: m.endDay,
      taskRange: [m.startDay, m.endDay],
      startDate: m.startDate,
      dueDate: m.dueDate,
      progressPercent: m.progressPercent,
      assignedTo: m.assignedTo,
      status: m.status,
      isCriticalPath: m.isCriticalPath,
      statusColor
    };
  });

  const completedCount = activeProject.milestones.filter(m => m.status === 'Completed').length;
  const inProgressCount = activeProject.milestones.filter(m => m.status === 'In Progress').length;
  const delayedCount = activeProject.milestones.filter(m => m.status === 'Delayed').length;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Construction Milestone Engine
              </span>
              <span className={`px-2.5 py-1 text-xs font-extrabold rounded-xl border ${
                activeProject.status === 'On Schedule' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                activeProject.status === 'Ahead of Schedule' ? 'bg-sky-500/20 text-sky-300 border-sky-400/30' :
                'bg-rose-500/20 text-rose-300 border-rose-400/30'
              }`}>
                {activeProject.status}
              </span>
              {boqItems.length > 0 && (
                <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-xl text-xs font-extrabold flex items-center gap-1">
                  <Package className="w-3 h-3 text-indigo-400" /> {boqItems.length} BOQ Orders Synced
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Gantt Timeline &amp; Milestone Schedule
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track project duration, milestone dates, dependencies, and critical path delays with real-time Recharts visual progress tracking.
            </p>
          </div>

          {/* Project Selector Switcher & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
              <label className="block text-[10px] text-slate-400 font-bold px-2 mb-1">Select Active Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleSelectProject(e.target.value)}
                className="w-full bg-slate-900 text-white font-bold text-xs p-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {SAMPLE_GANTT_PROJECTS.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.projectName} ({proj.city})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Milestone
            </button>

            <button
              onClick={() => {
                logAnalyticsEvent('gantt_schedule_exported', {
                  project_id: activeProject.id,
                  project_name: activeProject.projectName,
                  overall_progress: activeProject.overallProgress
                });
                alert(`Exporting Gantt Timeline Schedule for ${activeProject.projectName} (PDF / MS Project)...`);
              }}
              className="px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" /> Export Schedule
            </button>
          </div>
        </div>

        {/* View Scope Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-2xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewScope('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                viewScope === 'all' ? 'bg-teal-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 All Combined ({baseMilestones.length + boqMaterialMilestones.length})
            </button>
            <button
              onClick={() => setViewScope('milestones_only')}
              className={`px-3 py-1.5 rounded-xl transition ${
                viewScope === 'milestones_only' ? 'bg-teal-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏗️ Site Phases ({baseMilestones.length})
            </button>
            <button
              onClick={() => setViewScope('boq_orders_only')}
              className={`px-3 py-1.5 rounded-xl transition ${
                viewScope === 'boq_orders_only' ? 'bg-teal-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              📦 BOQ Material Orders ({boqMaterialMilestones.length})
            </button>
          </div>

          <div className="text-xs text-teal-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Interactive: Click status badge in table below to update order progress live</span>
          </div>
        </div>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-extrabold uppercase tracking-wider">Overall Progress</span>
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
              <span>{activeProject.overallProgress}%</span>
              <span className="text-xs font-semibold text-slate-400">Completed</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${activeProject.overallProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-extrabold uppercase tracking-wider">Project Timeline</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
              Day {activeProject.currentDayOffset} <span className="text-xs font-normal text-slate-400">/ {activeProject.totalDurationDays} Days</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 flex justify-between">
              <span>Start: {activeProject.startDate}</span>
              <span>Target: {activeProject.targetCompletionDate}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-extrabold uppercase tracking-wider">Milestone Breakdown</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="text-emerald-600 dark:text-emerald-400">{completedCount} Done</span>
              <span className="text-sky-600 dark:text-sky-400">{inProgressCount} Active</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Out of {activeProject.milestones.length} total scheduled phases
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-extrabold uppercase tracking-wider">Critical Path Risk</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className={`text-xl font-black ${delayedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {delayedCount > 0 ? `${delayedCount} Delayed Milestone` : '0 Bottlenecks Detected'}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {delayedCount > 0 ? 'Requires immediate supervisor intervention' : 'All critical path items moving on schedule'}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 1: VISUAL RECHARTS GANTT TIMELINE CHART */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-teal-600" />
              Recharts Interactive Gantt Chart (समयसीमा और माइलस्टोन गंट चार्ट)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Horizontal timeline showing milestone start, duration, and completion progress.
            </p>
          </div>

          {/* Category & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Categories</option>
              <option value="Approvals & Inspection">Approvals & Inspection</option>
              <option value="Civil & Foundation">Civil & Foundation</option>
              <option value="MEP & Solar">MEP & Solar</option>
              <option value="Finishes & Interiors">Finishes & Interiors</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>
        </div>

        {/* Legend Indicator Bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
            Completed Phase
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
            Active / In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span>
            Scheduled Future Phase
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
            Delayed Milestone
          </span>
          <span className="flex items-center gap-1.5 ml-auto text-amber-500 dark:text-amber-400">
            <span className="w-3 h-0.5 bg-amber-500 border border-amber-500"></span>
            Today Reference Line (Day {activeProject.currentDayOffset})
          </span>
        </div>

        {/* Recharts Horizontal Gantt Chart */}
        <div className="h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={ganttChartData}
              margin={{ top: 10, right: 30, left: 160, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, activeProject.totalDurationDays]}
                unit=" Days"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                type="category"
                dataKey="taskName"
                width={170}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              />
              <Tooltip content={<CustomGanttTooltip />} />
              
              {/* Reference Line representing Today */}
              <ReferenceLine
                x={activeProject.currentDayOffset}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{ value: `Today (Day ${activeProject.currentDayOffset})`, fill: '#f59e0b', fontSize: 10, position: 'top' }}
              />

              {/* Gantt Bar with Range [startDay, endDay] */}
              <Bar
                dataKey="taskRange"
                name="Milestone Timeline"
                radius={[6, 6, 6, 6]}
                barSize={18}
              >
                {ganttChartData.map((entry, index) => (
                  <Cell key={`gantt-cell-${index}`} fill={entry.statusColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* SECTION 2: DETAILED MILESTONE & CRITICAL PATH AUDIT TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              Detailed Milestone Audit Ledger (माइलस्टोन लेजर एवं कार्य प्रगति)
            </h2>
            <p className="text-xs text-slate-500">
              Assigned contractor details, target deadlines, completion % and dependencies
            </p>
          </div>

          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black">
            Showing {filteredMilestones.length} Milestones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-700 uppercase font-black tracking-wider">
                <th className="p-3 rounded-l-xl">Code</th>
                <th className="p-3">Milestone Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Start – Due Date</th>
                <th className="p-3">Assigned Supervisor</th>
                <th className="p-3">Progress %</th>
                <th className="p-3 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMilestones.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3 font-mono font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                    {m.isCriticalPath && <span title="Critical Path Task"><Flag className="w-3.5 h-3.5 text-amber-500 shrink-0" /></span>}
                    <span>{m.id}</span>
                  </td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                    {m.taskName}
                    {m.dependencies !== 'None' && (
                      <span className="block text-[10px] font-normal text-slate-400">Depends on: {m.dependencies}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded text-[10px]">
                      {m.category}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                    {m.startDate} → {m.dueDate}
                  </td>
                  <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{m.assignedTo}</td>
                  <td className="p-3">
                    <div className="space-y-1 w-28">
                      <div className="flex justify-between text-[10px] font-bold font-mono">
                        <span>{m.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${m.status === 'Completed' ? 'bg-emerald-500' : m.status === 'Delayed' ? 'bg-rose-500' : 'bg-teal-500'}`}
                          style={{ width: `${m.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      value={m.status}
                      onChange={(e) => handleUpdateMilestoneStatus(m.id, e.target.value as MilestoneTask['status'])}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer border ${
                        m.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
                        m.status === 'In Progress' ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300' :
                        m.status === 'Delayed' ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      <option value="Scheduled">🗓️ Scheduled</option>
                      <option value="In Progress">⚡ In Progress</option>
                      <option value="Completed">✅ Completed</option>
                      <option value="Delayed">⚠️ Delayed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: ADD CUSTOM MILESTONE / MATERIAL TASK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Add Milestone or PO Task
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Insert new site phase or material procurement schedule
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomMilestone} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Milestone / Material Order Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roof Slab Concrete Pouring or TMT Rebar Delivery"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category Phase
                  </label>
                  <select
                    value={newMilestoneCategory}
                    onChange={(e) => setNewMilestoneCategory(e.target.value as MilestoneTask['category'])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Civil & Foundation">Civil &amp; Foundation</option>
                    <option value="MEP & Solar">MEP &amp; Solar</option>
                    <option value="Finishes & Interiors">Finishes &amp; Interiors</option>
                    <option value="Approvals & Inspection">Approvals &amp; Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Supervisor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Er. Rajesh Gupta"
                    value={newMilestoneAssignedTo}
                    onChange={(e) => setNewMilestoneAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Day (Day Offset)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={newMilestoneStartDay}
                    onChange={(e) => setNewMilestoneStartDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={newMilestoneDurationDays}
                    onChange={(e) => setNewMilestoneDurationDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                <input
                  type="checkbox"
                  id="criticalPathCheck"
                  checked={newMilestoneIsCritical}
                  onChange={(e) => setNewMilestoneIsCritical(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <label htmlFor="criticalPathCheck" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Mark as Critical Path Task (High Risk)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Add to Gantt Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
