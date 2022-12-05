# HTML invoice template
![HTML invoice template example](https://raw.githubusercontent.com/templid/email-templates/main/templid-dynamic-templates/invoice-01/invoice-01-example.png)

This template was created to send dynamic data from Google Sheets using Templid.

You can use this template for your needs. Simply copy [invoice-01.html](https://github.com/templid/email-templates/blob/main/templid-dynamic-templates/invoice-01/invoice-01.html) and adopt it to your project.

If you want to try our simple and free Google Sheets invoicing system follow steps below:

1. Make a copy of Google sheets file: https://docs.google.com/spreadsheets/d/1pAyycrKj3GKHSvHo6lhp5BzUQ-rCB6qu1T96YFN1z50/edit?usp=sharing
1. Fill the data with your company information in `Settings` tab
1. Create free account on [templid.com](https://templid.com//)
1. Copy code from [invoice-01.html](https://github.com/templid/email-templates/blob/main/templid-dynamic-templates/invoice-01/invoice-01.html) and paste it to your template in templid.com. For the subject you can use same variables from HTML, eg. `Invoice {{ invoice.general.formatted_invoice_number }} for {{ customer[0] }}`
1. After, copy template ID from your dashboard in templid.com and paste it to your Google sheets `Settings` tab next to `templid_template_id` row
1. Generate token in the templid.com and paste it to your Google sheets `Settings` tab next to `templid_token` row
1. In your Google sheets document menu bar click on `Invoicing -> Send invoice` to send email to your customer with invoice data.

### Google script permissions

This Google sheets document is using custom script.

In order to send emails you have allow script to run on your behalf.

For the first time you'll click `Invoicing -> Send invoice` the new dialog window will appear. Click **Authorize**, then select your account and follow the steps shown in the image below:

![Google permissions](https://raw.githubusercontent.com/templid/email-templates/main/resources/google-script-permissions.png)