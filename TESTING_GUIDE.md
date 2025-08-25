# Ampere Engineering Application - Testing Guide

## Overview
This guide provides step-by-step instructions for testing all buttons and workflows in the Ampere Engineering application.

## Prerequisites
1. Node.js (version 18.0 or higher)
2. npm (comes with Node.js)
3. Git (for version control)

## Setup Instructions
1. Clone or download the project files
2. Navigate to the project directory:
   ```bash
   cd "AMPERE WEBAPP"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open browser and navigate to: http://localhost:3000

## Testing Scenarios

### 1. Authentication Workflow

#### Login Process
1. Navigate to http://localhost:3000
2. Click "Show Demo Credentials" to view available accounts
3. Test login with each role:
   - **Super Admin**: 
     - Email: john.tan@ampere.com.sg
     - Password: admin123
   - **Admin**: 
     - Email: sarah.lim@ampere.com.sg
     - Password: admin123
   - **Projects**: 
     - Email: david.wong@ampere.com.sg
     - Password: projects123
   - **Finance**: 
     - Email: michelle.chen@ampere.com.sg
     - Password: finance123
   - **Sales**: 
     - Email: robert.kumar@ampere.com.sg
     - Password: sales123

#### Role-based Dashboard Access
1. After logging in with each role, verify:
   - Super Admin: Access to all features and settings
   - Admin: Operational management features
   - Projects: Project management features only
   - Finance: Financial operations features
   - Sales: Sales and tender features

#### Logout Functionality
1. Click on user profile in top right corner
2. Select "Sign Out"
3. Verify redirected to login page

### 2. Vendor Specializations Management

#### Adding New Specialization
1. Login as Super Admin
2. Navigate to Settings > Vendor Specializations
3. Click "Add Specialization" button
4. Fill in form:
   - Label: "Plumbing Works"
   - Description: "Installation and maintenance of plumbing systems"
5. Click "Save Changes"
6. Verify new specialization appears in list

#### Editing Specialization
1. Find an existing specialization in the list
2. Click the edit (pencil) icon
3. Modify the description
4. Click "Save Changes"
5. Verify changes are reflected in the list

#### Activating/Deactivating Specialization
1. Find an existing specialization in the list
2. Click the activate/deactivate (checkmark/X) icon
3. Confirm the action in the dialog
4. Verify status change is reflected in the list

#### Deleting Specialization
1. Find a non-default specialization in the list
2. Click the delete (trash) icon
3. Confirm deletion in the dialog
4. Verify specialization is removed from the list

### 3. Frequently Used Items Management

#### Adding New Item
1. Login as Super Admin
2. Navigate to Settings > Frequently Used Items
3. Click "Add Item" button
4. Fill in form:
   - Description: "Electrical Installation"
   - Unit: "sqm"
   - Unit Price: 25.00
   - Category: "Materials"
5. Click "Save Changes"
6. Verify new item appears in list

#### Editing Item
1. Find an existing item in the list
2. Click the edit (pencil) icon
3. Modify the unit price
4. Click "Save Changes"
5. Verify changes are reflected in the list

#### Activating/Deactivating Item
1. Find an existing item in the list
2. Click the activate/deactivate (checkmark/X) icon
3. Confirm the action in the dialog
4. Verify status change is reflected in the list

#### Deleting Item
1. Find a non-default item in the list
2. Click the delete (trash) icon
3. Confirm deletion in the dialog
4. Verify item is removed from the list

### 4. Quotation Creation with Autocomplete

#### Creating New Quotation
1. Login as Sales or Admin user
2. Navigate to Quotations
3. Click "Create New Quotation" button
4. Fill in basic information:
   - Select a client
   - Enter quotation title
   - Enter description
   - Set valid until date
5. Click "Add Item" button

#### Testing Autocomplete Functionality
1. In the item description field, start typing to match existing frequently used items
2. Verify suggestions dropdown appears with matching items
3. Click on a suggestion
4. Verify that:
   - Description is populated
   - Unit is populated
   - Unit price is populated
   - Category is populated
   - Total price is calculated correctly

#### Adding Multiple Items
1. Add several items to the quotation
2. Modify quantities and verify total prices update
3. Add discount and verify summary calculations
4. Click "Create Quotation"

### 5. Settings Management

#### Updating Company Information
1. Login as Super Admin
2. Navigate to Settings > Company Info
3. Modify company details
4. Click "Save Changes"
5. Verify changes are saved

#### Exporting Settings
1. Navigate to Settings
2. Click "Export" button
3. Verify settings file is downloaded

#### Importing Settings
1. Navigate to Settings
2. Click "Import" button
3. Select a valid settings file
4. Verify import is successful

## Common Issues and Troubleshooting

### Environment Issues
- Ensure Node.js is properly installed and in PATH
- Clear npm cache if dependency issues occur:
  ```bash
  npm cache clean --force
  ```
- Delete node_modules and reinstall if needed:
  ```bash
  rm -rf node_modules
  npm install
  ```

### Browser Issues
- Clear browser cache and cookies
- Try in incognito/private browsing mode
- Test in different browsers (Chrome, Firefox, Edge)

### Data Persistence
- Settings are stored in localStorage
- Clear browser data to reset to default state

## Testing Checklist

### Authentication
- [ ] Login with all demo accounts
- [ ] Verify role-based dashboard access
- [ ] Test logout functionality
- [ ] Test session persistence

### Vendor Specializations
- [ ] Add new specialization
- [ ] Edit existing specialization
- [ ] Activate/deactivate specialization
- [ ] Delete non-default specialization
- [ ] Verify default specializations cannot be deleted

### Frequently Used Items
- [ ] Add new item
- [ ] Edit existing item
- [ ] Activate/deactivate item
- [ ] Delete non-default item
- [ ] Verify default items cannot be deleted

### Quotation Creation
- [ ] Create new quotation
- [ ] Test autocomplete suggestions
- [ ] Verify item population from suggestions
- [ ] Test calculations (totals, GST, discount)
- [ ] Save quotation

### Settings Management
- [ ] Update company information
- [ ] Modify system preferences
- [ ] Export settings
- [ ] Import settings

## Expected Results

All buttons and workflows should function without errors:
- Forms should validate input correctly
- Data should persist between sessions
- Role-based access should be enforced
- Calculations should be accurate
- UI should provide appropriate feedback for user actions

## Support

For issues not covered in this guide, contact the development team.