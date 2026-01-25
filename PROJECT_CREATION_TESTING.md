# Project Creation Feature - Testing Guide

## ✅ Changes Implemented

### 1. **Fixed Infinite Loop in useProjects Hook**
   - Destructured `useProjectState` return values to prevent re-renders
   - Stabilized all callback dependencies using `useCallback` and `useMemo`
   - Removed redundant `useEffect` that was calling `getProjects` on mount

### 2. **Authentication Integration**
   - Added Authorization header with Bearer token to all API requests
   - Backend now extracts `client_id` from authenticated user's token
   - Removed hardcoded `client_id` from frontend form submission

### 3. **Field Mapping (Frontend ↔ Backend)**
   - Backend service now maps camelCase fields to snake_case for database
   - `budget` → `budget_amount`
   - `clientId` → `client_id`
   - `onChainTxHash` → `on_chain_tx_hash`

### 4. **Validation Alignment**
   - **Title**: Minimum 5 characters (was 10)
   - **Description**: Minimum 20 characters (was 50)
   - **Skills**: Now optional (was required)
   - **client_id**: Removed from required fields (backend injects it)

### 5. **Navigation & UI Consistency**
   - Updated Sidebar to use real `Link` components.
   - Connected Sidebar to `/projects`, `/projects/new`, and `/projects/mine`.
   - Added `Edit` and `Assign` actions to the project cards in `My Projects`.
   - Connected `ProjectDashboard` to backend API (replacing mock data).

## 🧪 How to Test

### Prerequisites
1. **User must be logged in** - The token is required for authentication
2. **Backend server running** on `http://localhost:4000`
3. **Frontend server running** on `http://localhost:3001`

### Test Steps

1. **Navigate to Create Project Page**
   ```
   http://localhost:3001/projects/new
   ```

2. **Fill in the Form**
   - **Title**: "Test Project Creation" (min 5 chars)
   - **Description**: "This is a test description for the project creation feature." (min 20 chars)
   - **Category**: Select any category from dropdown (e.g., "Communication")
   - **Budget Amount**: 100
   - **Currency**: XLM (Stellar) - default
   - **Deadline**: Pick any future date

3. **Submit the Form**
   - Click "Create Project" button
   - Should show success toast message
   - Should redirect to `/projects/mine` after 3 seconds

4. **Verify Project Created**
   - Check `/projects/mine` page
   - New project should appear in the list
   - Project should have correct title, description, budget, etc.

## 🐛 Common Issues & Solutions

### Issue: "Authentication required"
**Solution**: Make sure you're logged in. Check localStorage for 'token' key.

### Issue: "Validation failed: Project description should be at least 20 characters long"
**Solution**: Ensure description has at least 20 characters.

### Issue: "Failed to create project"
**Solution**: 
1. Check browser console for detailed error
2. Verify backend is running on port 4000
3. Check network tab for API request/response

## 📝 API Endpoint

**POST** `/api/projects`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Test Project",
  "description": "This is a test project description with at least 20 characters.",
  "category": "web-development",
  "budget": 100,
  "currency": "XLM",
  "budgetType": "fixed",
  "projectType": "on-time",
  "experienceLevel": "entry",
  "visibility": "public",
  "deadline": "2026-02-01T00:00:00.000Z"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "uuid-here",
    "client_id": "user-id-from-token",
    "title": "Test Project",
    "description": "...",
    "budget": 100,
    "budget_amount": 100,
    "created_at": "2026-01-24T...",
    ...
  }
}
```

## 🔍 Debugging Tips

1. **Check Browser Console**: Look for any JavaScript errors
2. **Check Network Tab**: Inspect the POST request to `/api/projects`
3. **Check Backend Logs**: Look for any server-side errors
4. **Verify Token**: Use browser DevTools → Application → Local Storage → Check 'token' exists

## ✨ Expected Behavior

1. Form validates input on blur and on submit
2. Shows loading spinner while creating project
3. Displays success toast on successful creation
4. Redirects to "My Projects" page after 3 seconds
5. New project appears in the projects list with correct data
