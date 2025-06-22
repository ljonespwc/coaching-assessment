import { motion } from 'framer-motion';

interface Domain {
  id: number;
  name: string;
  description: string;
  color_hex: string;
  icon_emoji: string;
  display_order: number;
}

interface Question {
  id: number;
  domain_id: number;
}

interface DomainProgressSidebarProps {
  domains: Domain[];
  questions: Question[];
  responses: Record<number, number>;
  currentDomainId: number;
}

type DomainStatus = 'not-started' | 'in-progress' | 'complete';

export default function DomainProgressSidebar({ 
  domains, 
  questions, 
  responses, 
  currentDomainId 
}: DomainProgressSidebarProps) {
  
  const getDomainStatus = (domainId: number): DomainStatus => {
    const domainQuestions = questions.filter(q => q.domain_id === domainId);
    const answeredCount = domainQuestions.filter(q => responses[q.id] !== undefined).length;
    
    if (answeredCount === 0) return 'not-started';
    if (answeredCount === domainQuestions.length) return 'complete';
    return 'in-progress';
  };

  const getDomainProgress = (domainId: number) => {
    const domainQuestions = questions.filter(q => q.domain_id === domainId);
    const answeredCount = domainQuestions.filter(q => responses[q.id] !== undefined).length;
    return {
      current: answeredCount,
      total: domainQuestions.length,
      percentage: domainQuestions.length > 0 ? (answeredCount / domainQuestions.length) * 100 : 0
    };
  };

  const getStatusIcon = (status: DomainStatus) => {
    switch (status) {
      case 'complete':
        return '✓';
      case 'in-progress':
        return '◐';
      case 'not-started':
        return '○';
    }
  };

  const getStatusColor = (status: DomainStatus, domainColor: string) => {
    switch (status) {
      case 'complete':
        return domainColor;
      case 'in-progress':
        return domainColor;
      case 'not-started':
        return '#D1D5DB';
    }
  };

  // Sort domains by display_order
  const sortedDomains = [...domains].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Assessment Progress</h3>
      
      {sortedDomains.map((domain) => {
        const status = getDomainStatus(domain.id);
        const progress = getDomainProgress(domain.id);
        const isActive = domain.id === currentDomainId;
        const statusColor = getStatusColor(status, domain.color_hex);
        
        return (
          <motion.div
            key={domain.id}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
              isActive 
                ? 'border-current shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{
              borderColor: isActive ? domain.color_hex : undefined,
              backgroundColor: isActive ? `${domain.color_hex}10` : undefined
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Domain header */}
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: statusColor }}
              >
                {status === 'complete' || status === 'in-progress' ? 
                  getStatusIcon(status) : 
                  domain.icon_emoji
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {domain.name}
                </div>
                <div className="text-xs text-gray-500">
                  {progress.current} of {progress.total}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: statusColor,
                  width: `${progress.percentage}%` 
                }}
              />
            </div>

            {/* Status indicator */}
            {isActive && (
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
                <div 
                  className="w-2 h-8 rounded-r"
                  style={{ backgroundColor: domain.color_hex }}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
