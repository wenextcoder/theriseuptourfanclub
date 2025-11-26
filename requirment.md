Cursor Prompt for RISEUP Tour Fan Club Membership Form
Create a modern, responsive membership registration form for "The RISEUP Tour Fan Club (TRTFC)" using React, Next.js, and TypeScript. No payment gateway integration needed for now - prepare the structure for future API integration.
Form Requirements
Header Section

Title: "The RISEUP Tour Fan Club Membership"
Subtitle: "2026 Membership Application Form"
Instruction text: "Please complete all information below:"

Form Fields (in order)

Name (Required)

First Name (required)
Middle Name (optional)
Last Name (required)
Helper text: "Legal name. What's on your Driver License."


Nickname (Required)

Text input
Helper text: "If no nickname please put N/A"
Sub-label: "This name will be displayed on your TRTFC badge (No Sexual explicit names or profanity will be accepted)"
Validation note: "Please double check your spelling"


Email Address (Required)

Email validation
Helper text: "All TRTFC communication will be sent to this email"
Validation note: "please double check your spelling on your email"


Phone (Required)

Format: (###) ###-####
Helper text: "Cell number"


Birth Date (Required)

Month dropdown (January - December)
Day dropdown (1-31)
Year dropdown (1940-2007)
Helper text: "You must use your correct date of birth"


Address (Required)

Street Address (required)
Street Address Line 2 (optional)
City (required)
State/Province (required)
Postal/Zip Code (required)


How did you hear about TRTFC? (Required)

Dropdown options:

Please Select
N/A - Returning member
Social media
Website
Member referral
Other




Member's name who referred you (Conditional)

Show only if "Member referral" is selected
Text input (optional)


Current DBN Member? (Required)

Radio buttons: Yes / No
Helper text: "For the 2025 season"
Note: DBN = Dirty Bird Nest, Section 134


Where were you born? (Required)

City and State dropdown/widget
Helper text: "City and State you were born in"


Membership Status (Required)

Radio buttons:

"I am a new member (never joined TRTFC previously)"
"I am a current TRTFC paid member for the 2025 season"
"I am a past member from the 2024 season (or earlier)"


Helper text: "Your status as of 2025"


Membership Level Selection (Conditional, Required)

For NEW members:

Basic membership (New members only) - $75
Plus membership - $175
Premium membership - $225


For RETURNING members (past):

Plus membership - $175
Premium membership - $225


For CURRENT PAID members:

Premium membership (upgrade if renewed by Jan 15, 2026)
Plus membership (renewals after Jan 15, 2026)




Shirt Size (Unisex) (Required)

Dropdown: Small, Medium, Large, XL, 2X, 3X


Jacket Size (Unisex) (Required)

Dropdown: Small, Medium, Large, XL, 2X, 3X


Coupon Code (Optional)

Text input
Helper text: "Enter the Coupon Code for Discount"
Hidden coupon codes to validate: "THANKYOU25", "RISEUP25"


Terms and Conditions (Required)

Scrollable terms widget
Checkbox: "I agree to abide by the Code of Conduct for The RISEUP Tour Fan Club (TRTFC). Read all text to continue"
Include full Code of Conduct text (provided in original HTML)



Membership Tier Details
Basic Membership - $75 (New members only)

TRTFC Membership Emails & Updates
Official 2026 Membership Badge
TRTFC Lanyard

Plus Membership - $175

All Basic items
Official TRTFC T-Shirt
2026 Membership Jacket
Keychain
2026 Challenge Coin
Custom Bag Tag

Premium Membership - $225

2026 Bomber Jacket (Exclusive)
Keychain
2026 Challenge Coin
Official TRTFC T-Shirt
Custom Bag Tag
Lapel Pin
VIP Recognition at Select Events

Technical Requirements

Use React with TypeScript
Next.js framework (App Router preferred)
Form validation with react-hook-form and zod
Responsive design (mobile-first)
Modern UI with Tailwind CSS
Conditional field rendering based on selections
Form state management
Price calculation based on membership selection
Prepare data structure for future payment API integration
Include proper error handling and validation messages
Accessibility compliant (ARIA labels, keyboard navigation)

Design Preferences

Clean, modern interface
Clear visual hierarchy
Easy-to-read typography
Proper spacing and grouping of related fields
Progress indication
Mobile-optimized layout

Generate a complete, production-ready form component with all validations, conditional logic, and calculations implemented.