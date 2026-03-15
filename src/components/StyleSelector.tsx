import { DESIGN_STYLES } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: string | null;
  onSelect: (styleId: string) => void;
  recommendations?: string[];
}

export default function StyleSelector({ selectedStyle, onSelect, recommendations = [] }: StyleSelectorProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
    >
      {DESIGN_STYLES.map((style) => {
        const isRecommended = recommendations.includes(style.name);
        
        return (
          <motion.button
            key={style.id}
            variants={item}
            whileHover={{ 
              y: -4, 
              scale: 1.02,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(style.id)}
            className={`
              relative p-5 rounded-3xl text-left transition-all duration-300 border-2
              ${selectedStyle === style.id 
                ? 'bg-olive text-white border-olive shadow-xl ring-4 ring-olive/10' 
                : 'bg-white text-charcoal border-sand hover:border-olive/20'}
              ${isRecommended && selectedStyle !== style.id ? 'border-olive/30' : ''}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-lg font-serif font-semibold tracking-tight">{style.name}</span>
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                ${selectedStyle === style.id ? 'bg-white text-olive scale-100' : 'bg-sand text-transparent scale-75'}
              `}>
                <Check size={14} strokeWidth={3} />
              </div>
            </div>
            
            <AnimatePresence>
              {isRecommended && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2
                    ${selectedStyle === style.id ? 'bg-white/20 text-white' : 'bg-olive/10 text-olive'}
                  `}
                >
                  <Sparkles size={10} />
                  AI Recommended
                </motion.div>
              )}
            </AnimatePresence>

            <p className={`
              text-xs leading-relaxed transition-colors duration-300
              ${selectedStyle === style.id ? 'text-white/80' : 'text-charcoal/50'}
            `}>
              {style.description}
            </p>
            
            {selectedStyle === style.id && (
              <motion.div 
                layoutId="active-glow"
                className="absolute inset-0 rounded-3xl bg-olive/5 -z-10 blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
