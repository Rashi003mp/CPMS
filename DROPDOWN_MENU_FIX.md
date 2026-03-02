# Dropdown Menu Fix - Replace & Unassign Visibility

## Issue
The Replace and Unassign dropdown menus were not visible in the KEY PERSONNEL card on the project dashboard.

## Root Causes
1. **Conditional Rendering**: Menus were only shown when `projectManagerId` and `siteEngineerId` existed (backend not restarted yet)
2. **Dark Theme**: Dropdown menu was using dark theme (slate-900 background) which didn't match the light theme of the page
3. **No Hover Effect**: The three-dot button wasn't visible until hover

## Fixes Applied

### 1. Always Show Dropdown Menus
**File**: `app/(dashboard)/projects/[id]/page.tsx`

**Before**:
```tsx
{project.projectManagerId && (
  <DropdownMenu>
    {/* menu content */}
  </DropdownMenu>
)}
```

**After**:
```tsx
<DropdownMenu>
  {/* menu content - always visible */}
</DropdownMenu>
```

- Removed conditional rendering based on user IDs
- Added fallback value `|| 0` for user IDs when not available
- This allows testing before backend restart

### 2. Added Hover Effect
**File**: `app/(dashboard)/projects/[id]/page.tsx`

**Changes**:
- Added `group` class to parent div
- Added `opacity-0 group-hover:opacity-100 transition-opacity` to button
- Three-dot button now appears smoothly on hover

**Result**: Clean UI that shows controls only when needed

### 3. Fixed Dropdown Theme
**File**: `components/ui/dropdown-menu.tsx`

**Before** (Dark Theme):
```tsx
className="bg-slate-900 text-white border-slate-700"
hover:bg-slate-800
```

**After** (Light Theme):
```tsx
className="bg-white text-gray-900 border"
hover:bg-gray-100
```

**Result**: Dropdown menu now matches the light theme of the project dashboard

### 4. Enhanced Menu Item Styling
**File**: `app/(dashboard)/projects/[id]/page.tsx`

Added explicit styling to menu items:
- `cursor-pointer` - Shows pointer cursor
- `hover:bg-gray-100` - Light gray hover for normal items
- `hover:bg-red-50` - Light red hover for unassign (danger action)
- `bg-white` - Explicit white background for dropdown

## Visual Improvements

### Before:
- No visible three-dot button
- Dark dropdown (if it appeared)
- Conditional rendering prevented testing

### After:
- Three-dot button appears on hover with smooth fade-in
- Light-themed dropdown matching page design
- Always visible for testing
- Clear visual feedback on hover
- Red highlight for danger action (Unassign)

## User Experience

### Hover Interaction:
1. User hovers over assigned user card
2. Three-dot button fades in smoothly
3. Click opens light-themed dropdown
4. Replace option with refresh icon
5. Unassign option in red with X icon

### Menu Actions:
- **Replace**: Opens modal to select replacement user
- **Unassign**: Prompts for reason and removes user

## Testing Instructions

1. Navigate to any project dashboard
2. Hover over Project Manager or Site Engineer card
3. Three-dot button should appear on the right
4. Click the button to open dropdown menu
5. Verify light theme (white background)
6. Verify "Replace" and "Unassign" options are visible
7. Click "Replace" to test modal
8. Click "Unassign" to test prompt

## Notes

- Dropdown menus work even without backend restart
- User IDs default to 0 if not available (temporary for testing)
- Once backend is restarted with updated DTOs, actual user IDs will be used
- Hover effect provides clean UI without cluttering the interface
- Light theme matches the overall project dashboard design

## Files Modified

1. `app/(dashboard)/projects/[id]/page.tsx`
   - Removed conditional rendering
   - Added hover effects
   - Enhanced menu item styling

2. `components/ui/dropdown-menu.tsx`
   - Changed from dark to light theme
   - Updated hover colors
   - Improved visual consistency
