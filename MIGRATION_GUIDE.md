# FlowProvider → Zustand Migration Guide

## Overview
This guide covers the complete migration from React Context (FlowProvider) to Zustand with localStorage persistence.

## ✅ Completed Files

### 1. **Core Store Implementation**
- ✅ `lib/store.ts` - Complete Zustand store with persistence
- ✅ `hooks/use-flow-cleanup.ts` - Auto-cleanup hook
- ✅ `hooks/use-flow.ts` - Migration helper hook
- ✅ `components/flow-cleanup-provider.tsx` - Cleanup provider component

### 2. **Layout Updates**
- ✅ `app/layout.tsx` - Added FlowCleanupProvider

### 3. **Component Updates**
- ✅ `app/analysis-options/page.tsx` - Migrated to use new useFlow hook

## 🔄 Files That Need Migration

### ✅ Migration Status:
- ✅ `app/analysis-options/page.tsx` - **COMPLETED**
- ✅ No other files found using FlowProvider/useFlow

### 🔍 Verification:
Based on codebase analysis, only `analysis-options/page.tsx` was using the flow context. All other components appear to use different state management approaches.

### Migration Steps for Each Component:

#### Step 1: Update Imports
```typescript
// OLD
import { useFlow } from "@/contexts/flow-context"

// NEW
import { useFlow } from "@/hooks/use-flow"
```

#### Step 2: Component Usage (No Changes Needed)
The `useFlow` hook maintains the same API, so existing component code works as-is:
```typescript
const { flowState, updateFlowState, clearFlowState } = useFlow()
```

#### Step 3: New Features Available
```typescript
const { 
  flowState, 
  updateFlowState, 
  loading,        // NEW: Loading states
  errors,         // NEW: Error states
  submitToAMQP    // NEW: AMQP submission
} = useFlow()
```

## 🗑️ Files to Remove

After migration is complete:
1. `contexts/flow-context.tsx` - Delete entire file
2. Remove FlowProvider from any remaining imports

## 🔧 Key Features

### Auto-Cleanup
- Data expires after 24 hours by default
- Automatic cleanup on page visibility change
- Periodic cleanup every 5 minutes

### Enhanced Error Handling
```typescript
const { errors, loading } = useFlow()

if (errors.databaseError) {
  // Handle database errors
}

if (loading.savingToDatabase) {
  // Show loading state
}
```

### AMQP Integration
```typescript
const { submitToAMQP } = useFlow()

const handleSubmit = async () => {
  const success = await submitToAMQP()
  if (success) {
    // Flow state automatically cleared
    router.push('/success')
  }
}
```

## 🔒 Security & Performance

### What's Persisted
- ✅ User form inputs
- ✅ Movie selections
- ✅ Analysis preferences
- ✅ Voice selections
- ❌ Authentication tokens (not persisted)
- ❌ Sensitive user data (not persisted)

### Performance Benefits
- No React Context re-renders
- Selective subscriptions with Zustand
- Automatic localStorage sync
- Efficient state updates

## 🧪 Testing Migration

### Test Checklist
- [ ] Form data persists across page refreshes
- [ ] Data expires after 24 hours
- [ ] AMQP submission clears flow state
- [ ] Error states display correctly
- [ ] Loading states work properly
- [ ] Navigation between steps works
- [ ] Movie selection → Analysis → Voice → Script → Submission flow

### Test Commands
```bash
# Check for remaining FlowProvider usage
grep -r "useFlow" app/ --include="*.tsx" --include="*.ts"
grep -r "FlowProvider" app/ --include="*.tsx" --include="*.ts"
grep -r "flow-context" app/ --include="*.tsx" --include="*.ts"
```

## 🚀 Deployment Notes

### Environment Considerations
- localStorage is client-side only
- SSR compatibility maintained
- No server-side dependencies

### Rollback Plan
If issues arise, temporarily restore:
1. `contexts/flow-context.tsx`
2. Add FlowProvider back to layout
3. Revert component imports

## 📊 Benefits Achieved

1. **Simplified State Management**: No more Context Provider wrapping
2. **Better Performance**: Selective subscriptions, no unnecessary re-renders
3. **Enhanced Persistence**: Automatic localStorage with expiration
4. **Improved Error Handling**: Structured error states
5. **AMQP Integration**: Built-in job submission with cleanup
6. **Type Safety**: Full TypeScript support
7. **Auto-Cleanup**: Prevents stale data accumulation

## 🔍 Debugging

### Common Issues
1. **Data not persisting**: Check localStorage in DevTools
2. **Premature cleanup**: Verify expiration times
3. **Type errors**: Ensure proper TypeScript interfaces

### Debug Tools
```typescript
// Access store directly in DevTools
window.__ZUSTAND_STORE__ = useFlowStore.getState()
```
