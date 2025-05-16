// This is a browser-compatible version that uses fetch instead of direct googleapis imports
// All actual Google Sheets API calls are made through API routes

// Helper function to make API calls
async function fetchAPI(endpoint: string, method = "GET", body?: any) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`/api/${endpoint}`, options)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching API ${endpoint}:`, error)
    throw error
  }
}

// Exported functions that will be called from components
export async function checkSheetsConnection() {
  return await fetchAPI("test-sheets-connection")
}

// Constants for working with Google Sheets
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CURRENT_GRADES_SHEET = "Grades"
const PREVIOUS_GRADES_SHEET = "Previous_Grades"
const TESTS_DATES_SHEET = "Tests_dates"

// Data ranges
const CURRENT_GRADES_RANGE = "A2:T28"
const PREVIOUS_GRADES_RANGE = "A2:T28"
const TESTS_DATES_RANGE = "A2:C18"

// Constants for notifications
const NOTIFICATIONS_SHEET = "Notifications"
const NOTIFICATIONS_RANGE = "A2:D100"

// Constants for student data
const STUDENTS_SHEET = "Students"
const STUDENTS_RANGE = "A2:E100"

// Last update cell
const LAST_UPDATE_CELL = "U2"

// Constants for comments
const COMMENTS_SHEET = "Comments"
const COMMENTS_RANGE = "A2:G1000"

// Initialize Google Auth (stub for browser)
export async function initGoogleAuth() {
  // This is a stub function that doesn't actually do anything in the browser
  // The actual auth happens in the API routes
  return null
}

// Mock getGoogleSheetsClient for browser environment
async function getGoogleSheetsClient() {
  // This function should never be called in the browser, as all API calls are made through the /api routes
  throw new Error("getGoogleSheetsClient should not be called in the browser.")
}

// Function to get sheet data (stub for browser)
export async function getSheetData(range: string) {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    return response.data.values || []
  } catch (error) {
    console.error(`Error getting data from range ${range}:`, error)
    throw error
  }
}

// Function to update sheet data (stub for browser)
export async function updateSheetData(range: string, values: any[][]) {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    })

    return response.data
  } catch (error) {
    console.error(`Error updating data in range ${range}:`, error)
    throw error
  }
}

// Function to append sheet data (stub for browser)
export async function appendSheetData(range: string, values: any[][]) {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    })

    return response.data
  } catch (error) {
    console.error(`Error appending data to range ${range}:`, error)
    throw error
  }
}

// Function to get all sheets (stub for browser)
export async function getSheets() {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    return response.data.sheets || []
  } catch (error) {
    console.error("Error getting sheets list:", error)
    throw error
  }
}

// Function to create a new sheet (stub for browser)
export async function createSheet(title: string) {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title,
              },
            },
          },
        ],
      },
    })

    return response.data
  } catch (error) {
    console.error(`Error creating sheet ${title}:`, error)
    throw error
  }
}

// Function to get class performance data
export async function getClassPerformanceData() {
  const response = await fetchAPI("class-performance")
  return response.data
}

// Function to cleanup conflict sheets
export async function cleanupConflictSheets() {
  const response = await fetchAPI("cleanup-conflicts")
  return response.success
}

// Function to get comments
export async function getComments(includeHidden = false, includeDeleted = false) {
  const response = await fetchAPI(`comments?includeHidden=${includeHidden}&includeDeleted=${includeDeleted}`)
  return response.data || []
}

// Function to add comment
export async function addComment(authorId: string, author: string, text: string) {
  const response = await fetchAPI("comments", "POST", { authorId, author, text })
  return response.data
}

// Function to toggle comment visibility
export async function toggleCommentVisibility(commentId: string, hide: boolean) {
  const response = await fetchAPI(`comments/${commentId}`, "PATCH", { hide })
  return response.success
}

// Function to delete comment
export async function deleteComment(commentId: string) {
  const response = await fetchAPI(`comments/${commentId}`, "DELETE")
  return response.success
}

// Function to log login
export async function logLogin(username: string, success: boolean, ip: string, device: string, userAgent: string) {
  const response = await fetchAPI("log-login", "POST", { username, success, ip, device, userAgent })
  return response.success
}

// Function to add notification
export async function addNotificationToSheets(title: string, message: string, type: string) {
  const response = await fetchAPI("notifications", "POST", { title, message, type })
  return response.success
}

// Function to get notifications
export async function getNotificationsFromSheets() {
  const response = await fetchAPI("notifications")
  return response.data || []
}

// Function to get student grades
export async function getStudentGradesFromSheets(studentId: string) {
  const response = await fetchAPI(`student-grades?studentId=${studentId}`)
  if (!response.success) return null
  return { data: response.data, lastUpdate: response.lastUpdate || "" }
}

// Function to get upcoming tests
export async function getUpcomingTests() {
  const response = await fetchAPI("upcoming-tests")
  return response.data || []
}

// Function to get students
export async function getStudentsFromSheets() {
  const response = await fetchAPI("students")
  return response.data || []
}

// Function to add grade
export async function addGradeToSheets(
  studentId: string,
  subjectId: string,
  value: number,
  date: string,
  quarter?: string,
) {
  const response = await fetchAPI("manage-grades", "POST", {
    action: "add",
    studentId,
    subjectId,
    value,
    date,
    quarter,
  })
  return response.success
}

// Function to update grade
export async function updateGradeInSheets(
  studentId: string,
  subjectId: string,
  gradeIndex: number,
  value: number,
  quarter?: string,
) {
  const response = await fetchAPI("manage-grades", "POST", {
    action: "update",
    studentId,
    subjectId,
    gradeIndex,
    value,
    quarter,
  })
  return response.success
}

// Function to delete grade
export async function deleteGradeFromSheets(
  studentId: string,
  subjectId: string,
  gradeIndex: number,
  quarter?: string,
) {
  const response = await fetchAPI("manage-grades", "POST", {
    action: "delete",
    studentId,
    subjectId,
    gradeIndex,
    quarter,
  })
  return response.success
}

// Function to initialize student sheet
export async function initStudentSheet(studentId: string) {
  const response = await fetchAPI("init-student-sheet", "POST", { studentId })
  return response.success
}
