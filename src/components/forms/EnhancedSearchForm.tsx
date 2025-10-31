'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plane, Calendar as CalendarIcon, ArrowLeftRight } from 'lucide-react';
import SearchForm from './SearchForm';
import MultiCitySearchForm from './MultiCitySearchForm';
import FlexibleDateSearchForm from '../search/FlexibleDateSearchForm';

interface EnhancedSearchFormProps {
  onSearch?: (data: any) => void;
  onMultiCitySearch?: (data: any) => void;
  onFlexibleSearch?: (data: any) => void;
}

export default function EnhancedSearchForm({ 
  onSearch, 
  onMultiCitySearch,
  onFlexibleSearch 
}: EnhancedSearchFormProps) {
  const [activeTab, setActiveTab] = useState<'standard' | 'multi-city' | 'flexible'>('standard');

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm">
          <TabsTrigger 
            value="standard" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Plane className="w-4 h-4" />
            <span className="hidden sm:inline">Standard</span>
          </TabsTrigger>
          <TabsTrigger 
            value="multi-city"
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="hidden sm:inline">Multi-City</span>
          </TabsTrigger>
          <TabsTrigger 
            value="flexible"
            className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Flexible Dates</span>
          </TabsTrigger>
        </TabsList>

        {/* Standard Search */}
        <TabsContent value="standard" className="mt-0">
          <SearchForm onSearch={onSearch} />
        </TabsContent>

        {/* Multi-City Search */}
        <TabsContent value="multi-city" className="mt-0">
          <MultiCitySearchForm onSearch={onMultiCitySearch} />
        </TabsContent>

        {/* Flexible Date Search */}
        <TabsContent value="flexible" className="mt-0">
          <FlexibleDateSearchForm onSearch={onFlexibleSearch} />
        </TabsContent>
      </Tabs>

      {/* Search Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 Search Tips:</p>
          <ul className="space-y-1 text-blue-700">
            {activeTab === 'standard' && (
              <>
                <li>• Book round trips for better deals</li>
                <li>• Try nearby airports for more options</li>
                <li>• Flexible dates can save you money</li>
              </>
            )}
            {activeTab === 'multi-city' && (
              <>
                <li>• Add up to 6 destinations in one trip</li>
                <li>• Each segment can be on different dates</li>
                <li>• Great for complex itineraries</li>
              </>
            )}
            {activeTab === 'flexible' && (
              <>
                <li>• See prices for ±3 days around your dates</li>
                <li>• Find the cheapest days to fly</li>
                <li>• Perfect for travelers with flexible schedules</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
