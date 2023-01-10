/**
 * IMPORTANT! Copy IDs of your sheets and replace "0" in the list below
 **/
const SHEETS_IDS = {
  settings: 0, // <-- Replace this with actual sheet ID
  customers: 0, // <-- Replace this with actual sheet ID
  invoiceData: 0, // <-- Replace this with actual sheet ID
  invoiceProducts: 0, // <-- Replace this with actual sheet ID
  sales: 0, // <-- Replace this with actual sheet ID
  h_billTo: 0, // <-- Replace this with actual sheet ID
  h_products: 0, // <-- Replace this with actual sheet ID
}

/**
 * Add custom menu
 */
function onOpen()
{
  var ui = SpreadsheetApp.getUi()
  
  ui.createMenu('Invoicing')
    .addItem('Add invoice to sales table', 'addToSales')
    .addItem('Send invoice email', 'setInvoiceEmail')
    .addToUi()
}

/**
 * Possibility to add every invoice to separate sheet
 */
function addToSales()
{
  const invoiceDataObject = sheetToKeyValueObject(SHEETS_IDS.invoiceData)

  let productSum = 0

  getSheetById(SHEETS_IDS.h_products)
    .getRange('B1:D')
    .getDisplayValues()
    .forEach(function(data) {
      if (data[0].length === 0) {
        return
      }

      productSum += data[1] * data[2]
    })

  const vat = parseFloat(invoiceDataObject.vat_rate) / 100;

  const productSumWithVat = productSum * vat + productSum

  getSheetById(SHEETS_IDS.sales).appendRow([
    invoiceDataObject.invoice_number,
    invoiceDataObject.invoice_date,
    invoiceDataObject.customer,
    productSum,
    vat,
    productSumWithVat,
    invoiceDataObject.invoice_due,
    'No'
  ])
}

/**
 * Automatically send invoice email to the customer.
 * 
 * To use this feature, you have to provide template ID and token from templid.com
 */
function setInvoiceEmail()
{
  const invoiceData = sheetToKeyValueObject(SHEETS_IDS.invoiceData)
  const totalsData  = getSheetById(SHEETS_IDS.h_products).getRange('I1:I3').getDisplayValues()

  const data = {
    settings: sheetToKeyValueObject(SHEETS_IDS.settings),
    customer: getCustomerData(),
    invoice: {
      general: invoiceData,
      products: getProductLineItems(),
      totals: {
        productsWithoutVat: totalsData[0][0],
        vat: totalsData[1][0],
        productsWithVat: totalsData[2][0]
      }
    }
  }

  if (!validateTemplidSettings(data.settings)) {
    return showAlert('You have to provide valid email ID and token to send emails')
  }

  let templidUrl = 'https://api.templid.com/v1/templates/' + data.settings.templid_template_id.trim() + '/render'

  let response = UrlFetchApp.fetch(templidUrl, {
    muteHttpExceptions: true,
    method: 'POST',
    contentType: 'application/json',
    payload : JSON.stringify(data),
    headers: {
      'Authorization': 'Bearer ' + data.settings.templid_token.trim()
    }
  })

  let responseBody = JSON.parse(response.getContentText())

  if (responseBody.hasOwnProperty('error')) {
    return showAlert('Check settings "templid_template_id" and "templid_token". Error message from Templid: "' + responseBody.error + '"')
  }

  MailApp.sendEmail(
    data.invoice.general.recipient_email,
    responseBody.subject,
    responseBody.text,
    {
      htmlBody: responseBody.html
    }
  )
}

/**
 * Show pop-up message
 */
function showAlert(message)
{
  let ui = SpreadsheetApp.getUi()

  ui.alert(message)

  return false
}

/**
 * Validate settings before making requests
 */
function validateTemplidSettings(settings)
{
  if (isNaN(parseInt(settings.templid_template_id.trim()))) {
    return false
  }

  let tokenSplit = settings.templid_token.split('|')

  if (tokenSplit.length < 2) {
    return false
  }

  return true
}

/**
 * Get invoice products
 */
function getProductLineItems()
{
  const products    = getSheetById(SHEETS_IDS.h_products).getRange('B1:I').getDisplayValues()
  const productsLen = products.length

  const lineItems = []

  for (let i = 0; i < productsLen; ++i) {
    if (products[i][0].length === 0) {
      return lineItems
    }

    lineItems.push({
      name: products[i][0],
      quantity: products[i][1],
      price: products[i][4],
      subtotal: products[i][5]
    })
  }

  return lineItems
}

/**
 * Parse data from sheet and return non-empty rows only
 */
function getCustomerData()
{
  const customerData    = getSheetById(SHEETS_IDS.h_billTo).getRange('A1:B').getDisplayValues()
  const customerDataLen = customerData.length

  const result = []

  for (let i = 0; i < customerDataLen; ++i) {
    if (customerData[i][1].length === 0) {
      return result
    }

    let lineItem = customerData[i][0] + ' ' +  customerData[i][1]
    
    result.push(lineItem.trim())
  }

  return result
}

/**
 * Get sheet by ID.
 * 
 * We use this to avoid tab/sheet renaming coupling
 */
function getSheetById(id) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var name        = getSheetNameById(spreadsheet.getSheets(), id)

  return spreadsheet.getSheetByName(name)
}

/**
 * Get sheet name by ID
 */
function getSheetNameById(allSheets, id)
{
  for(var i = 0; i < allSheets.length; i += 1) {
    if (id == allSheets[i].getSheetId()) {
      return allSheets[i].getSheetName()
    }
  }

  return null;
}

/**
 * Parse data from sheet with two columns (A:B) and return key-value object.
 * Where A column is `key` and B column is `value`.
 */
function sheetToKeyValueObject(sheetId) {
  const sheet    = getSheetById(sheetId).getRange('A1:B').getDisplayValues()
  const sheetLen = sheet.length;

  const result = {}

  for (let i = 0; i < sheetLen; ++i) {
    if (sheet[i][0].length === 0) {
      return result
    }

    result[sheet[i][0]] = sheet[i][1]
  }

  return result
}
