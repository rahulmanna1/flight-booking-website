'use client';

import { useState } from 'react';
import { Keyboard, X, HelpCircle } from 'lucide-react';

export default function KeyboardNavigationHelp() {
  const [isVisible, setIsVisible] = useState(false);

  const shortcuts = [
    {
      category: 'Flight Cards',
      shortcuts: [
        { keys: ['Tab'], description: 'Navigate between flight cards and buttons' },
        { keys: ['Enter'], description: 'Select flight when focused on card' },
        { keys: ['Space'], description: 'Select flight when focused on card' },
        { keys: ['↓'], description: 'Move to Select Flight button from card' },
      ]
    },
    {
      category: 'Flight Comparison',
      shortcuts: [
        { keys: ['Escape'], description: 'Close comparison modal' },
        { keys: ['↑', '↓'], description: 'Navigate between comparison categories' },
        { keys: ['←', '→'], description: 'Navigate between flight selection buttons' },
        { keys: ['1-5'], description: 'Quick jump to comparison categories' },
      ]
    },
    {
      category: 'General',
      shortcuts: [
        { keys: ['Tab'], description: 'Navigate forward through interactive elements' },
        { keys: ['Shift', '+', 'Tab'], description: 'Navigate backward through interactive elements' },
        { keys: ['Enter'], description: 'Activate buttons and links' },
        { keys: ['Space'], description: 'Activate buttons and checkboxes' },
      ]
    }
  ];

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-40 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Show keyboard navigation help"
        title="Keyboard Shortcuts"
      >
        <Keyboard className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => setIsVisible(false)}
      />
      
      {/* Help Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div 
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="keyboard-help-title"
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Keyboard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h2 id="keyboard-help-title" className="text-lg sm:text-xl font-bold text-gray-900">
                Keyboard Navigation
              </h2>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close keyboard help"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800">
                    This flight booking website is designed to be fully accessible via keyboard. 
                    Use these shortcuts to navigate more efficiently.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {shortcuts.map((category) => (
                <div key={category.category}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {category.category}
                  </h3>
                  <div className="space-y-2">
                    {category.shortcuts.map((shortcut, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-0">
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {shortcut.keys.map((key, keyIndex) => (
                            <span key={keyIndex} className="inline-flex items-center">
                              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-semibold text-gray-700 shadow-sm">
                                {key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="mx-1 text-gray-500">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 sm:ml-4">{shortcut.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Tip:</strong> All interactive elements have focus indicators (blue outline) 
                and descriptive labels for screen readers. The interface follows standard web accessibility guidelines.
              </p>
            </div>
          </div>

          <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200">
            <button
              onClick={() => setIsVisible(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}