/**
 * GhostAtlas Theme Usage Examples
 * 
 * This file contains practical examples of using the neon green and red theme.
 * Copy and paste these patterns into your components.
 */

import React from 'react';
import { Button } from '@/components/common/Button';

// ============================================
// Example 1: Page Header with Red Accent
// ============================================
export function PageHeaderExample() {
  return (
    <div className="text-center mb-8">
      <h1 className="font-creepster text-5xl text-ghost-green text-glow mb-4">
        Ghost<span className="text-ghost-red shadow-red-glow-lg">Atlas</span>
      </h1>
      <p className="text-ghost-gray text-lg">
        Explore the <span className="text-ghost-red font-semibold">paranormal</span> world
      </p>
    </div>
  );
}

// ============================================
// Example 2: Interactive Card with Hover
// ============================================
export function InteractiveCardExample() {
  return (
    <div className="
      group
      bg-ghost-near-black
      border-2 border-ghost-green/30
      rounded-lg p-6
      cursor-pointer
      transition-all duration-300
      hover:border-ghost-red
      hover:shadow-red-glow-lg
      hover:scale-[1.03]
    ">
      <h3 className="
        font-creepster text-2xl
        text-ghost-green
        group-hover:text-ghost-red
        transition-colors mb-2
      ">
        Haunted Location
      </h3>
      <p className="text-ghost-gray">
        Click to explore this spooky encounter
      </p>
    </div>
  );
}

// ============================================
// Example 3: Button Group
// ============================================
export function ButtonGroupExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary" size="large">
        Primary Action
      </Button>
      <Button variant="neon-red" size="large">
        Secondary Action
      </Button>
      <Button variant="ghost" size="large">
        Tertiary Action
      </Button>
    </div>
  );
}

// ============================================
// Example 4: Stats Display
// ============================================
export function StatsDisplayExample() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-4 bg-ghost-near-black border border-ghost-green rounded-lg">
        <div className="text-3xl font-bold text-ghost-green text-glow">
          1,234
        </div>
        <div className="text-sm text-ghost-gray mt-1">
          Encounters
        </div>
      </div>
      
      <div className="text-center p-4 bg-ghost-near-black border border-ghost-red rounded-lg">
        <div className="text-3xl font-bold text-ghost-red text-glow-red">
          567
        </div>
        <div className="text-sm text-ghost-gray mt-1">
          Verified
        </div>
      </div>
      
      <div className="text-center p-4 bg-ghost-near-black border border-ghost-green rounded-lg">
        <div className="text-3xl font-bold text-ghost-green text-glow">
          89
        </div>
        <div className="text-sm text-ghost-gray mt-1">
          Locations
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 5: Alert/Notification
// ============================================
export function AlertExample() {
  return (
    <div className="space-y-4">
      {/* Success Alert */}
      <div className="
        bg-ghost-near-black
        border-l-4 border-ghost-green
        p-4 rounded-r-lg
        shadow-green-glow
      ">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-ghost-green mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-ghost-green font-medium">
            Encounter submitted successfully!
          </p>
        </div>
      </div>

      {/* Warning Alert */}
      <div className="
        bg-ghost-near-black
        border-l-4 border-ghost-red
        p-4 rounded-r-lg
        shadow-red-glow
      ">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-ghost-red mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-ghost-red font-medium">
            This location has high paranormal activity!
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 6: Loading State
// ============================================
export function LoadingExample() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="
        w-16 h-16
        border-4 border-ghost-green
        border-t-ghost-red
        rounded-full
        animate-spin
        shadow-green-glow
      " />
    </div>
  );
}

// ============================================
// Example 7: Badge/Tag
// ============================================
export function BadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="
        px-3 py-1
        bg-ghost-green/20
        border border-ghost-green
        text-ghost-green text-sm
        rounded-full
        shadow-green-glow
      ">
        Approved
      </span>
      
      <span className="
        px-3 py-1
        bg-ghost-red/20
        border border-ghost-red
        text-ghost-red text-sm
        rounded-full
        shadow-red-glow
      ">
        Featured
      </span>
      
      <span className="
        px-3 py-1
        bg-ghost-gray/20
        border border-ghost-gray
        text-ghost-gray text-sm
        rounded-full
      ">
        Pending
      </span>
    </div>
  );
}

// ============================================
// Example 8: Progress Bar
// ============================================
export function ProgressBarExample() {
  const progress = 65;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-ghost-gray">Enhancement Progress</span>
        <span className="text-ghost-green">{progress}%</span>
      </div>
      <div className="
        w-full h-2
        bg-ghost-dark-gray
        rounded-full
        overflow-hidden
      ">
        <div
          className="
            h-full
            bg-gradient-to-r from-ghost-green to-ghost-red
            shadow-green-glow
            transition-all duration-500
          "
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// Example 9: Rating Stars
// ============================================
export function RatingExample() {
  const rating = 4;
  
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-6 h-6 transition-colors ${
            star <= rating
              ? 'text-ghost-red fill-current shadow-red-glow'
              : 'text-ghost-gray/30'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-ghost-gray text-sm ml-2">
        ({rating}/5)
      </span>
    </div>
  );
}

// ============================================
// Example 10: Feature Card
// ============================================
export function FeatureCardExample() {
  return (
    <div className="
      bg-ghost-near-black
      border-2 border-ghost-green/30
      rounded-lg p-6
      hover:border-ghost-red
      hover:shadow-red-glow-lg
      transition-all duration-300
    ">
      <div className="
        w-12 h-12
        bg-ghost-red/20
        border-2 border-ghost-red
        rounded-lg
        flex items-center justify-center
        mb-4
        shadow-red-glow
      ">
        <svg className="w-6 h-6 text-ghost-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      <h3 className="font-creepster text-2xl text-ghost-green mb-2">
        AI Enhancement
      </h3>
      
      <p className="text-ghost-gray">
        Your encounters are enhanced with AI-generated narratives and illustrations
      </p>
    </div>
  );
}

// ============================================
// Example 11: Timeline Item
// ============================================
export function TimelineItemExample() {
  return (
    <div className="flex items-start space-x-4">
      <div className="
        flex-shrink-0
        w-10 h-10
        bg-ghost-red
        rounded-full
        flex items-center justify-center
        shadow-red-glow-lg
      ">
        <span className="text-ghost-black font-bold">1</span>
      </div>
      
      <div className="flex-1">
        <h4 className="text-ghost-green font-semibold mb-1">
          Submit Your Encounter
        </h4>
        <p className="text-ghost-gray text-sm">
          Share your paranormal experience with the community
        </p>
      </div>
    </div>
  );
}

// ============================================
// Example 12: Search Bar
// ============================================
export function SearchBarExample() {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search encounters..."
        className="
          w-full
          bg-ghost-near-black
          border-2 border-ghost-green/30
          text-ghost-gray
          placeholder-ghost-gray/50
          px-4 py-3 pr-12
          rounded-lg
          focus:border-ghost-red
          focus:shadow-red-glow-lg
          focus:outline-none
          transition-all duration-300
        "
      />
      <button className="
        absolute right-3 top-1/2 -translate-y-1/2
        text-ghost-green
        hover:text-ghost-red
        transition-colors
      ">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  );
}

// ============================================
// Example 13: Tooltip
// ============================================
export function TooltipExample() {
  return (
    <div className="relative group inline-block">
      <button className="
        px-4 py-2
        bg-ghost-green
        text-ghost-black
        rounded-lg
        hover:shadow-green-glow-lg
        transition-all
      ">
        Hover Me
      </button>
      
      <div className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        px-3 py-2
        bg-ghost-near-black
        border border-ghost-red
        text-ghost-red text-sm
        rounded-lg
        shadow-red-glow-lg
        opacity-0 group-hover:opacity-100
        pointer-events-none
        transition-opacity
        whitespace-nowrap
      ">
        This is a tooltip
        <div className="
          absolute top-full left-1/2 -translate-x-1/2
          border-4 border-transparent border-t-ghost-red
        " />
      </div>
    </div>
  );
}

// ============================================
// Example 14: Skeleton Loader
// ============================================
export function SkeletonLoaderExample() {
  return (
    <div className="space-y-4">
      <div className="
        h-48 w-full
        bg-ghost-dark-gray
        rounded-lg
        loading-skeleton
      " />
      <div className="
        h-4 w-3/4
        bg-ghost-dark-gray
        rounded
        loading-skeleton
      " />
      <div className="
        h-4 w-1/2
        bg-ghost-dark-gray
        rounded
        loading-skeleton
      " />
    </div>
  );
}

// ============================================
// Example 15: Modal Header
// ============================================
export function ModalHeaderExample() {
  return (
    <div className="
      flex items-center justify-between
      p-6
      border-b-2 border-ghost-green/30
    ">
      <h2 className="font-creepster text-3xl text-ghost-green text-glow">
        Encounter Details
      </h2>
      <button className="
        w-8 h-8
        text-ghost-gray
        hover:text-ghost-red
        hover:shadow-red-glow
        transition-all
        rounded-full
        flex items-center justify-center
      ">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default {
  PageHeaderExample,
  InteractiveCardExample,
  ButtonGroupExample,
  StatsDisplayExample,
  AlertExample,
  LoadingExample,
  BadgeExample,
  ProgressBarExample,
  RatingExample,
  FeatureCardExample,
  TimelineItemExample,
  SearchBarExample,
  TooltipExample,
  SkeletonLoaderExample,
  ModalHeaderExample,
};
