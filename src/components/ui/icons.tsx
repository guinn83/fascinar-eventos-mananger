import React from 'react'
import {
  Users,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  DollarSign,
  Edit,
  XCircle,
  AlertCircle,
  Lock,
  LogOut,
  TrendingUp,
  CalendarCheck,
  User,
  Download,
  Search,
  UserCheck,
  UserX,
  Zap,
  Eye,
  ChevronDown,
  ChevronUp,
  Edit3,
  Printer,
  Camera,
  CheckCircle,
  Info,
  Settings,
  AlertTriangle,
  HelpCircle,
  AlignLeft,
  ArrowLeft,
  Moon,
  Sun,
} from 'lucide-react'

// Centralized map of default icons for the app.
// Use this module as the source-of-truth for which icon to show in titles, cards and actions.
export const IconMap = {
  Users,
  TrendingUp,
  CalendarCheck,
  User,
  LogOut,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  DollarSign,
  Edit,
  XCircle,
  AlertCircle,
  Lock,
  Download,
  Search,
  UserCheck,
  UserX,
  Zap,
  Eye,
  ChevronDown,
  ChevronUp,
  Edit3,
  Printer,
  Camera,
  CheckCircle,
  Info,
  Settings,
  AlertTriangle,
  HelpCircle,
  AlignLeft,
  ArrowLeft,
  Moon,
  Sun,
} as const

export type IconName = keyof typeof IconMap

export const Icon: React.FC<
  { name: IconName; className?: string; size?: number; title?: string } & React.SVGProps<SVGSVGElement>
> = ({ name, className, size = 18, ...props }) => {
  const Comp = IconMap[name] as React.ComponentType<any>
  return <Comp className={className} size={size} {...props} />
}

export default IconMap
