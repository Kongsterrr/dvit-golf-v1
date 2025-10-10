'use client';

import { motion } from 'framer-motion';
import { Eye, RotateCcw, Maximize2 } from 'lucide-react';
import { Configuration } from '../app/customize/page';

interface ConfigurationPreviewProps {
  configuration: Configuration;
}

export default function ConfigurationPreview({ configuration }: ConfigurationPreviewProps) {
  const getMaterialColor = (material?: string) => {
    switch (material) {
      case 'aluminum_6061':
        return 'from-gray-300 to-gray-500';
      case 'copper_alloy':
        return 'from-orange-400 to-orange-600';
      case 'stainless_steel_303':
        return 'from-blue-300 to-blue-500';
      case 'polymer':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getWeightSystemShape = (type?: string) => {
    return type === 'long_wing' ? 'w-16 h-4' : 'w-12 h-4';
  };

  return (
    <div className="bg-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">实时预览</h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D 预览区域 */}
      <div className="relative aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-xl mb-6 overflow-hidden">
        {/* 背景网格 */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* 推杆预览 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* 推杆杆身 */}
            <div className="w-2 h-32 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full mx-auto mb-2" />
            
            {/* Face Deck */}
            <motion.div 
              className={`w-20 h-8 bg-gradient-to-r ${getMaterialColor(configuration.faceDeck?.material)} rounded-lg mx-auto mb-2 shadow-lg`}
              key={configuration.faceDeck?.material}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
            
            {/* 配重系统 */}
            {configuration.weightSystem && (
              <motion.div 
                className={`${getWeightSystemShape(configuration.weightSystem.type)} bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mx-auto shadow-lg`}
                key={configuration.weightSystem.type}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              />
            )}
          </motion.div>
        </div>

        {/* 旋转动画指示器 */}
        <motion.div 
          className="absolute bottom-4 right-4 w-8 h-8 border-2 border-dvit-accent rounded-full flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Eye className="w-4 h-4 text-dvit-accent" />
        </motion.div>

        {/* 未配置提示 */}
        {(!configuration.faceDeck || !configuration.weightSystem) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <Eye className="w-8 h-8 text-dvit-gray mx-auto mb-2" />
              <p className="text-sm text-dvit-gray">
                {!configuration.faceDeck && !configuration.weightSystem 
                  ? '请选择配置选项'
                  : !configuration.faceDeck 
                    ? '请选择Face Deck材质'
                    : '请选择配重系统'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 配置摘要 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-dvit-white">当前配置</h4>
        
        {/* Face Deck 配置 */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div>
            <p className="text-sm font-medium">Face Deck</p>
            <p className="text-xs text-dvit-gray">
              {configuration.faceDeck?.name || '未选择'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-dvit-accent">
              {configuration.faceDeck?.price === 0 ? '标准' : configuration.faceDeck ? `+$${configuration.faceDeck.price}` : '-'}
            </p>
          </div>
        </div>

        {/* 配重系统配置 */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div>
            <p className="text-sm font-medium">配重系统</p>
            <p className="text-xs text-dvit-gray">
              {configuration.weightSystem?.name || '未选择'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-dvit-accent">
              {configuration.weightSystem ? `+$${configuration.weightSystem.price}` : '-'}
            </p>
          </div>
        </div>

        {/* 配置完成度 */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dvit-gray">配置完成度</span>
            <span className="text-sm font-medium">
              {(configuration.faceDeck ? 50 : 0) + (configuration.weightSystem ? 50 : 0)}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-dvit-accent to-dvit-gold h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(configuration.faceDeck ? 50 : 0) + (configuration.weightSystem ? 50 : 0)}%` 
              }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}