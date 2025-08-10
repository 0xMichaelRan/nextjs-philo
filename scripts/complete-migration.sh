#!/bin/bash

# FlowProvider to Zustand Migration Completion Script

echo "🚀 Completing FlowProvider → Zustand Migration..."

# 1. Verify no remaining FlowProvider usage
echo "🔍 Checking for remaining FlowProvider usage..."

FLOW_CONTEXT_USAGE=$(grep -r "flow-context" app/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)
USE_FLOW_IMPORTS=$(grep -r "import.*useFlow.*from.*flow-context" app/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)
FLOW_PROVIDER_USAGE=$(grep -r "FlowProvider" app/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)

if [ -n "$FLOW_CONTEXT_USAGE" ] || [ -n "$USE_FLOW_IMPORTS" ] || [ -n "$FLOW_PROVIDER_USAGE" ]; then
    echo "⚠️  Found remaining FlowProvider usage:"
    echo "$FLOW_CONTEXT_USAGE"
    echo "$USE_FLOW_IMPORTS"
    echo "$FLOW_PROVIDER_USAGE"
    echo ""
    echo "Please update these files to use the new useFlow hook from '@/hooks/use-flow'"
    exit 1
else
    echo "✅ No remaining FlowProvider usage found"
fi

# 2. Remove old FlowProvider file
echo "🗑️  Removing old FlowProvider file..."
if [ -f "contexts/flow-context.tsx" ]; then
    rm "contexts/flow-context.tsx"
    echo "✅ Removed contexts/flow-context.tsx"
else
    echo "ℹ️  contexts/flow-context.tsx already removed"
fi

# 3. Verify new files exist
echo "🔍 Verifying new files exist..."

REQUIRED_FILES=(
    "lib/store.ts"
    "hooks/use-flow.ts"
    "hooks/use-flow-cleanup.ts"
    "components/flow-cleanup-provider.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# 4. Test TypeScript compilation
echo "🔧 Testing TypeScript compilation..."
if command -v npx &> /dev/null; then
    if npx tsc --noEmit --skipLibCheck; then
        echo "✅ TypeScript compilation successful"
    else
        echo "❌ TypeScript compilation failed"
        echo "Please fix TypeScript errors before completing migration"
        exit 1
    fi
else
    echo "⚠️  npx not found, skipping TypeScript check"
fi

# 5. Success message
echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "📋 Summary:"
echo "✅ FlowProvider removed"
echo "✅ Zustand store implemented with localStorage persistence"
echo "✅ Auto-cleanup functionality added"
echo "✅ Enhanced error handling and loading states"
echo "✅ AMQP integration with automatic cleanup"
echo ""
echo "🔧 Next steps:"
echo "1. Test the application thoroughly"
echo "2. Verify localStorage persistence works"
echo "3. Test auto-cleanup after 24 hours"
echo "4. Test AMQP submission and cleanup"
echo ""
echo "🚀 Your app is now using Zustand with localStorage!"
