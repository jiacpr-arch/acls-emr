import {
  Heart, HeartPulse, Activity, Zap, Pill, Stethoscope, Settings, Home,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  AlertCircle, AlertTriangle, Check, X, Plus, Minus,
  Trash, Edit, Save, Share, Download, Upload, FileText,
  Search, Menu, MoreHorizontal, MoreVertical,
  User, Users, Phone, Calendar, Clock, Timer,
  Play, Pause, StopCircle, RefreshCw, RotateCcw,
  Wind, Droplet, Brain, Bandage, Syringe, Microscope, FlaskConical, TestTube,
  TrendingUp, TrendingDown, BarChart3, LineChart, PieChart,
  Camera, Image, BookOpen, GraduationCap, Award, Trophy,
  Star, Bell, MessageSquare, Send, Mic, Volume2, VolumeX,
  Eye, EyeOff, Lightbulb, Info, HelpCircle,
  ListOrdered, List, Layers, Sparkles, Shield, ShieldCheck, Hospital,
} from 'lucide-react';

const map = {
  // medical / clinical
  '🫀': HeartPulse,
  '💔': Heart,
  '🧠': Brain,
  '🫁': Wind,
  '⚡': Zap,
  '💉': Syringe,
  '💊': Pill,
  '🩺': Stethoscope,
  '🌬️': Wind,
  '🩸': Droplet,

  // status / feedback
  '🚨': AlertTriangle,
  '🛡️': Shield,
  '✅': Check,
  '❌': X,
  '🔴': AlertCircle,
  '🟢': ShieldCheck,
  '⏸': Pause,
  '⏸️': Pause,
  '▶️': Play,
  '🔄': RefreshCw,
  '💚': HeartPulse,

  // navigation / system
  '🏥': Hospital,
  '📋': FileText,
  '📄': FileText,
  '📝': Edit,
  '⚙️': Settings,
  '🔍': Search,
  '🏆': Trophy,
  '🎮': Sparkles,
  '🏋️': Activity,
  '📊': BarChart3,
  '📈': TrendingUp,
  '📉': TrendingDown,
  '📖': BookOpen,
  '📗': BookOpen,
  '📚': GraduationCap,
  '💬': MessageSquare,
  '📸': Camera,
  '👤': User,
  '👥': Users,
  '👋': User,
  '📞': Phone,

  // animals — used for bradycardia (slow) / tachycardia (fast)
  '🐢': TrendingDown,
  '🐇': TrendingUp,

  // misc
  '≡': Menu,
  '▼': ChevronDown,
  '▶': ChevronRight,
  '⬇': ChevronDown,
  '⬆': ChevronUp,
};

// Convenience exports for direct use
export {
  Heart, HeartPulse, Activity, Zap, Pill, Stethoscope, Settings, Home,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  AlertCircle, AlertTriangle, Check, X, Plus, Minus,
  Trash, Edit, Save, Share, Download, Upload, FileText,
  Search, Menu, MoreHorizontal, MoreVertical,
  User, Users, Phone, Calendar, Clock, Timer,
  Play, Pause, StopCircle, RefreshCw, RotateCcw,
  Wind, Droplet, Brain, Bandage, Syringe, Microscope, FlaskConical, TestTube,
  TrendingUp, TrendingDown, BarChart3, LineChart, PieChart,
  Camera, Image, BookOpen, GraduationCap, Award, Trophy,
  Star, Bell, MessageSquare, Send, Mic, Volume2, VolumeX,
  Eye, EyeOff, Lightbulb, Info, HelpCircle,
  ListOrdered, List, Layers, Sparkles, Shield, ShieldCheck, Hospital,
};

/**
 * Renders a lucide icon by emoji key or by name. Falls back to the emoji string.
 * Default size 18, stroke 2.
 */
export default function Icon({ emoji, name, size = 18, strokeWidth = 2, className = '', ...rest }) {
  const Cmp = name || (emoji && map[emoji]);
  if (Cmp && typeof Cmp !== 'string') {
    return <Cmp size={size} strokeWidth={strokeWidth} className={className} {...rest} />;
  }
  return <span className={className} aria-hidden="true">{emoji}</span>;
}
