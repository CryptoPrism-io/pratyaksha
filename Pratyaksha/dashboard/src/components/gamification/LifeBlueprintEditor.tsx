// Life Blueprint Editor - Vision, Anti-Vision, Levers, Goals
import { useState } from "react";
import {
  Compass,
  Target,
  AlertTriangle,
  Gauge,
  Plus,
  X,
  ChevronDown,
  Check,
  Circle,
  Briefcase,
  Heart,
  Users,
  DollarSign,
  TrendingUp,
  Home,
  Globe,
  Star,
} from "lucide-react";
import { useLifeBlueprint } from "../../hooks/useLifeBlueprint";
import {
  VISION_CATEGORIES,
  GOAL_CATEGORIES,
  type VisionCategory,
  type GoalCategory,
  type Lever,
} from "../../lib/lifeBlueprintStorage";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

// Icon map for categories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="h-3.5 w-3.5" />,
  Heart: <Heart className="h-3.5 w-3.5" />,
  Users: <Users className="h-3.5 w-3.5" />,
  DollarSign: <DollarSign className="h-3.5 w-3.5" />,
  TrendingUp: <TrendingUp className="h-3.5 w-3.5" />,
  Home: <Home className="h-3.5 w-3.5" />,
  Globe: <Globe className="h-3.5 w-3.5" />,
  Star: <Star className="h-3.5 w-3.5" />,
};

interface LifeBlueprintEditorProps {
  className?: string;
}

export function LifeBlueprintEditor({ className }: LifeBlueprintEditorProps) {
  const {
    blueprint,
    isEmpty,
    addVision,
    removeVision,
    addAntiVision,
    removeAntiVision,
    addLever,
    removeLever,
    addShortTermGoal,
    addLongTermGoal,
    toggleShortTermGoal,
    toggleLongTermGoal,
    removeShortTermGoal,
    removeLongTermGoal,
  } = useLifeBlueprint();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["vision", "antiVision"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div className={cn("rounded-xl glass-card p-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
          <Compass className="h-5 w-5 text-indigo-500" />
        </div>
        <div>
          <h2 className="font-semibold">Life Blueprint</h2>
          <p className="text-sm text-muted-foreground">
            Define your direction so AI understands what matters to you
          </p>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-8 mb-4 rounded-lg border-2 border-dashed border-muted">
          <Compass className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            Your life blueprint is empty
          </p>
          <p className="text-xs text-muted-foreground">
            Add your vision, what you want to avoid, and goals below
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Vision Section */}
        <BlueprintSection
          title="Vision"
          subtitle="Where I want to be"
          icon={<Target className="h-4 w-4 text-emerald-500" />}
          color="emerald"
          expanded={expandedSections.has("vision")}
          onToggle={() => toggleSection("vision")}
          itemCount={blueprint.vision.length}
        >
          <VisionList
            items={blueprint.vision}
            onRemove={removeVision}
            color="emerald"
          />
          <AddVisionForm onAdd={addVision} placeholder="e.g., Financial independence by 45" />
        </BlueprintSection>

        {/* Anti-Vision Section */}
        <BlueprintSection
          title="Anti-Vision"
          subtitle="What I'm avoiding"
          icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
          color="rose"
          expanded={expandedSections.has("antiVision")}
          onToggle={() => toggleSection("antiVision")}
          itemCount={blueprint.antiVision.length}
        >
          <VisionList
            items={blueprint.antiVision}
            onRemove={removeAntiVision}
            color="rose"
          />
          <AddVisionForm onAdd={addAntiVision} placeholder="e.g., Burnout from overwork" />
        </BlueprintSection>

        {/* Levers Section */}
        <BlueprintSection
          title="Levers"
          subtitle="What influences my direction"
          icon={<Gauge className="h-4 w-4 text-amber-500" />}
          color="amber"
          expanded={expandedSections.has("levers")}
          onToggle={() => toggleSection("levers")}
          itemCount={blueprint.levers.length}
        >
          <LeverList items={blueprint.levers} onRemove={removeLever} />
          <AddLeverForm onAdd={addLever} />
        </BlueprintSection>

        {/* Short-term Goals */}
        <BlueprintSection
          title="Short-term Goals"
          subtitle="This month / quarter"
          icon={<Target className="h-4 w-4 text-sky-500" />}
          color="sky"
          expanded={expandedSections.has("shortTerm")}
          onToggle={() => toggleSection("shortTerm")}
          itemCount={blueprint.shortTermGoals.length}
        >
          <GoalList
            items={blueprint.shortTermGoals}
            onToggle={toggleShortTermGoal}
            onRemove={removeShortTermGoal}
          />
          <AddGoalForm onAdd={addShortTermGoal} placeholder="e.g., Launch MVP" />
        </BlueprintSection>

        {/* Long-term Goals */}
        <BlueprintSection
          title="Long-term Goals"
          subtitle="This year and beyond"
          icon={<Target className="h-4 w-4 text-violet-500" />}
          color="violet"
          expanded={expandedSections.has("longTerm")}
          onToggle={() => toggleSection("longTerm")}
          itemCount={blueprint.longTermGoals.length}
        >
          <GoalList
            items={blueprint.longTermGoals}
            onToggle={toggleLongTermGoal}
            onRemove={removeLongTermGoal}
          />
          <AddGoalForm onAdd={addLongTermGoal} placeholder="e.g., 10,000 paying users" />
        </BlueprintSection>
      </div>
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

interface BlueprintSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: "emerald" | "rose" | "amber" | "sky" | "violet";
  expanded: boolean;
  onToggle: () => void;
  itemCount: number;
  children: React.ReactNode;
}

function BlueprintSection({
  title,
  subtitle,
  icon,
  color,
  expanded,
  onToggle,
  itemCount,
  children,
}: BlueprintSectionProps) {
  const colorClasses = {
    emerald: "bg-emerald-500/10 border-emerald-500/30",
    rose: "bg-rose-500/10 border-rose-500/30",
    amber: "bg-amber-500/10 border-amber-500/30",
    sky: "bg-sky-500/10 border-sky-500/30",
    violet: "bg-violet-500/10 border-violet-500/30",
  };

  return (
    <div className={cn("rounded-lg border", colorClasses[color])}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <div className="text-left">
            <span className="text-sm font-medium">{title}</span>
            <span className="text-xs text-muted-foreground ml-2">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {itemCount > 0 && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>
      {expanded && <div className="p-3 pt-0 space-y-2">{children}</div>}
    </div>
  );
}

// Vision/Anti-Vision List
interface VisionListProps {
  items: { id: string; text: string; category: VisionCategory }[];
  onRemove: (id: string) => void;
  color: "emerald" | "rose";
}

function VisionList({ items, onRemove, color }: VisionListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {items.map(item => {
        const cat = VISION_CATEGORIES.find(c => c.value === item.category);
        return (
          <div
            key={item.id}
            className="flex items-center gap-2 p-2 rounded-md bg-background/50 group"
          >
            <span className="text-muted-foreground">
              {cat && CATEGORY_ICONS[cat.icon]}
            </span>
            <span className="text-sm flex-1">{item.text}</span>
            <button
              onClick={() => onRemove(item.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Add Vision Form
interface AddVisionFormProps {
  onAdd: (text: string, category: VisionCategory) => void;
  placeholder: string;
}

function AddVisionForm({ onAdd, placeholder }: AddVisionFormProps) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<VisionCategory>("personal-growth");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (text.trim()) {
      onAdd(text.trim(), category);
      setText("");
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="h-3 w-3" />
        Add item
      </button>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <select
        value={category}
        onChange={e => setCategory(e.target.value as VisionCategory)}
        className="text-xs px-2 py-1.5 rounded border bg-background"
      >
        {VISION_CATEGORIES.map(cat => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        placeholder={placeholder}
        className="flex-1 text-sm px-2 py-1.5 rounded border bg-background"
        autoFocus
      />
      <Button size="sm" onClick={handleSubmit} disabled={!text.trim()}>
        Add
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

// Lever List
interface LeverListProps {
  items: Lever[];
  onRemove: (id: string) => void;
}

function LeverList({ items, onRemove }: LeverListProps) {
  if (items.length === 0) return null;

  const directionColors = {
    vision: "text-emerald-500",
    "anti-vision": "text-rose-500",
    both: "text-amber-500",
  };

  return (
    <div className="space-y-1.5">
      {items.map(item => (
        <div
          key={item.id}
          className="flex items-start gap-2 p-2 rounded-md bg-background/50 group"
        >
          <Gauge className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
          <div className="flex-1">
            <span className="text-sm font-medium">{item.name}</span>
            <p className="text-xs text-muted-foreground">{item.description}</p>
            <span className={cn("text-[10px]", directionColors[item.pushesToward])}>
              → {item.pushesToward}
            </span>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Add Lever Form
interface AddLeverFormProps {
  onAdd: (name: string, description: string, pushesToward: Lever["pushesToward"]) => void;
}

function AddLeverForm({ onAdd }: AddLeverFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pushesToward, setPushesToward] = useState<Lever["pushesToward"]>("both");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim(), description.trim(), pushesToward);
      setName("");
      setDescription("");
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="h-3 w-3" />
        Add lever
      </button>
    );
  }

  return (
    <div className="space-y-2 mt-2 p-2 rounded-md bg-background/50">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Lever name (e.g., Sleep quality)"
        className="w-full text-sm px-2 py-1.5 rounded border bg-background"
        autoFocus
      />
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="How it affects you (e.g., Impacts energy and decisions)"
        className="w-full text-sm px-2 py-1.5 rounded border bg-background"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Pushes toward:</span>
        <select
          value={pushesToward}
          onChange={e => setPushesToward(e.target.value as Lever["pushesToward"])}
          className="text-xs px-2 py-1 rounded border bg-background"
        >
          <option value="vision">Vision (positive)</option>
          <option value="anti-vision">Anti-vision (negative)</option>
          <option value="both">Both (depends)</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!name.trim()}>
          Add Lever
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Goal List
interface GoalListProps {
  items: { id: string; text: string; category: GoalCategory; completed: boolean }[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

function GoalList({ items, onToggle, onRemove }: GoalListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {items.map(item => (
        <div
          key={item.id}
          className="flex items-center gap-2 p-2 rounded-md bg-background/50 group"
        >
          <button onClick={() => onToggle(item.id)} className="flex-shrink-0">
            {item.completed ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <span
            className={cn(
              "text-sm flex-1",
              item.completed && "line-through text-muted-foreground"
            )}
          >
            {item.text}
          </span>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {item.category}
          </span>
          <button
            onClick={() => onRemove(item.id)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Add Goal Form
interface AddGoalFormProps {
  onAdd: (text: string, category: GoalCategory, targetDate?: string) => void;
  placeholder: string;
}

function AddGoalForm({ onAdd, placeholder }: AddGoalFormProps) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<GoalCategory>("projects");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (text.trim()) {
      onAdd(text.trim(), category);
      setText("");
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="h-3 w-3" />
        Add goal
      </button>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <select
        value={category}
        onChange={e => setCategory(e.target.value as GoalCategory)}
        className="text-xs px-2 py-1.5 rounded border bg-background"
      >
        {GOAL_CATEGORIES.map(cat => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        placeholder={placeholder}
        className="flex-1 text-sm px-2 py-1.5 rounded border bg-background"
        autoFocus
      />
      <Button size="sm" onClick={handleSubmit} disabled={!text.trim()}>
        Add
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
