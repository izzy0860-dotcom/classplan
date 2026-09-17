// Google Sheets & Google Apps Script (Code.gs) sync helper for classroom data collection

const GS_URL_KEY = 'hope_google_sheets_url';

export const getGoogleSheetsUrl = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GS_URL_KEY) || '';
};

export const setGoogleSheetsUrl = (url: string): void => {
  if (typeof window === 'undefined') return;
  const trimmed = url.trim();
  if (trimmed) {
    localStorage.setItem(GS_URL_KEY, trimmed);
  } else {
    localStorage.removeItem(GS_URL_KEY);
  }
};

export interface RemotePledgeItem {
  id?: string;
  studentNumber: number;
  studentName: string;
  cardTitle?: string;
  cardId?: number;
  pledgeText: string;
  stampColor: string;
  handType: 'left' | 'right';
  stampAngle?: number;
  timestamp?: string | number;
}

/**
 * Fetches all student pledges saved in the Google Spreadsheet.
 * This allows each student on their Chromebook to view classmates' pledges in real-time.
 */
export const fetchPledgesFromGoogleSheets = async (
  customUrl?: string
): Promise<{ success: boolean; pledges: RemotePledgeItem[]; message?: string }> => {
  const url = customUrl || getGoogleSheetsUrl();
  if (!url) {
    return { success: false, pledges: [], message: '구글 시트 URL이 설정되지 않았습니다.' };
  }

  try {
    const separator = url.includes('?') ? '&' : '?';
    const fetchUrl = `${url}${separator}action=getPledges&t=${Date.now()}`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`서버 응답 오류: ${response.status}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data.pledges)) {
      return {
        success: true,
        pledges: data.pledges,
      };
    }

    return {
      success: true,
      pledges: [],
    };
  } catch (error) {
    console.warn('Google Sheets fetch warning:', error);
    return {
      success: false,
      pledges: [],
      message: error instanceof Error ? error.message : '불러오기 실패',
    };
  }
};

export interface SheetPayload {
  action: 'vote' | 'pledge' | 'test' | 'batch_sync';
  classTitle?: string;
  studentNumber?: number;
  studentName?: string;
  cardId?: number;
  cardTitle?: string;
  pledgeText?: string;
  stampColor?: string;
  handType?: string;
  timestamp?: string;
  votes?: Array<{
    studentNumber: number;
    studentName: string;
    cardTitle: string;
    timestamp: string;
  }>;
  pledges?: Array<{
    studentNumber: number;
    studentName: string;
    cardTitle: string;
    pledgeText: string;
    stampColor: string;
    handType: string;
    timestamp: string;
  }>;
}

/**
 * Sends a payload to Google Apps Script Web App.
 * Uses text/plain with mode: 'no-cors' to bypass browser CORS preflight & redirect issues
 * while ensuring Google Apps Script receives the POST data in e.postData.contents.
 */
export const sendToGoogleSheets = async (
  payload: SheetPayload,
  customUrl?: string
): Promise<{ success: boolean; message: string }> => {
  const url = customUrl || getGoogleSheetsUrl();
  if (!url) {
    return { success: false, message: '구글 스프레드시트 Web App URL이 설정되지 않았습니다.' };
  }

  try {
    // Add current time in Korean timezone string
    const enrichedPayload = {
      ...payload,
      timestamp: payload.timestamp || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    };

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(enrichedPayload),
    });

    return {
      success: true,
      message: '구글 스프레드시트에 성공적으로 전송되었습니다!',
    };
  } catch (error) {
    console.error('Google Sheets sync error:', error);
    return {
      success: false,
      message: `전송 중 오류 발생: ${error instanceof Error ? error.message : '네트워크 확인 필요'}`,
    };
  }
};

/**
 * Standard Code.gs script template for teachers
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * 교실에서 찾은 희망 - 4학년 실천 약속 & 손도장 다짐 연동 스크립트
 * (Google Apps Script: Code.gs)
 * 
 * [배포 방법]
 * 1. 구글 스프레드시트 > 확장 프로그램 > Apps Script 클릭
 * 2. 이 코드 전체를 붙여넣고 저장(디스켓 아이콘)
 * 3. 우측 상단 [배포] > [새 배포] > 유형: [웹 앱]
 *    - 다음 사용자 권한으로 실행: 나 (선생님 계정)
 *    - 액세스 권한이 있는 사용자: 모든 사용자 (Anyone)  <-- 중요!
 * 4. 생성된 웹 앱 URL(https://script.google.com/macros/s/.../exec)을 복사하여 앱에 붙여넣기
 */

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : "";

  // 학생들의 크롬북에서 다른 친구들의 실천 다짐을 실시간으로 읽어갈 때
  if (action === "getPledges" || action === "getData") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("2.손도장서약");
    var pledges = [];

    if (sheet && sheet.getLastRow() > 1) {
      var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var numStr = String(row[2]).replace(/[^0-9]/g, "");
        var studentNum = parseInt(numStr, 10) || (i + 1);
        pledges.push({
          id: "pledge_" + studentNum + "_" + i,
          timestamp: row[0],
          classTitle: row[1],
          studentNumber: studentNum,
          studentName: String(row[3]) || (studentNum + "번 학생"),
          cardTitle: String(row[4]),
          pledgeText: String(row[5]),
          stampColor: String(row[6]) || "#DC2626",
          handType: String(row[7]).indexOf("왼") >= 0 ? "left" : "right",
          stampAngle: ((studentNum * 7) % 24) - 12
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      count: pledges.length,
      pledges: pledges
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Index.html 파일이 있는 경우 웹 화면 출력, 없을 경우 상태 JSON 반환
  try {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('교실에서 찾은 희망 - 21명 실천 약속 & 손도장 서약')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "교실에서 찾은 희망 구글 시트 연동 웹 앱이 정상 작동 중입니다."
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(10000); // 10초 대기

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var now = data.timestamp || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    var classTitle = data.classTitle || "우리 반";

    if (action === "test") {
      var testSheet = getOrCreateSheet(ss, "0.연동테스트", [
        "테스트시각", "학급명", "상태", "메모"
      ]);
      testSheet.appendRow([now, classTitle, "연동 성공 ✓", "웹 앱과 구글 스프레드시트가 성공적으로 연결되었습니다!"]);
      lock.releaseLock();
      return createSuccessResponse("연동 테스트 성공");
    }

    if (action === "vote") {
      var voteSheet = getOrCreateSheet(ss, "1.투표결과", [
        "기록시각", "학급명", "학생번호", "학생이름", "선택한 약속"
      ]);
      voteSheet.appendRow([
        now,
        classTitle,
        data.studentNumber + "번",
        data.studentName || (data.studentNumber + "번 학생"),
        data.cardTitle
      ]);
      lock.releaseLock();
      return createSuccessResponse("투표 기록 완료");
    }

    if (action === "pledge") {
      var pledgeSheet = getOrCreateSheet(ss, "2.손도장서약", [
        "서약시각", "학급명", "학생번호", "학생이름", "실천약속", "다짐 한마디", "손도장색상", "손방향"
      ]);
      pledgeSheet.appendRow([
        now,
        classTitle,
        data.studentNumber + "번",
        data.studentName || (data.studentNumber + "번 학생"),
        data.cardTitle,
        data.pledgeText,
        data.stampColor,
        data.handType === "left" ? "왼손 ✋" : "오른손 ✋"
      ]);
      lock.releaseLock();
      return createSuccessResponse("손도장 서약 기록 완료");
    }

    if (action === "batch_sync") {
      // 일괄 동기화
      if (data.votes && data.votes.length > 0) {
        var vSheet = getOrCreateSheet(ss, "1.투표결과", [
          "기록시각", "학급명", "학생번호", "학생이름", "선택한 약속"
        ]);
        for (var i = 0; i < data.votes.length; i++) {
          var v = data.votes[i];
          vSheet.appendRow([v.timestamp || now, classTitle, v.studentNumber + "번", v.studentName, v.cardTitle]);
        }
      }
      if (data.pledges && data.pledges.length > 0) {
        var pSheet = getOrCreateSheet(ss, "2.손도장서약", [
          "서약시각", "학급명", "학생번호", "학생이름", "실천약속", "다짐 한마디", "손도장색상", "손방향"
        ]);
        for (var j = 0; j < data.pledges.length; j++) {
          var p = data.pledges[j];
          pSheet.appendRow([
            p.timestamp || now,
            classTitle,
            p.studentNumber + "번",
            p.studentName,
            p.cardTitle,
            p.pledgeText,
            p.stampColor,
            p.handType === "left" ? "왼손 ✋" : "오른손 ✋"
          ]);
        }
      }
      lock.releaseLock();
      return createSuccessResponse("일괄 동기화 완료");
    }

    lock.releaseLock();
    return createSuccessResponse("요청 처리 완료");

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#FFF3CD")
               .setFontColor("#78350F")
               .setFontWeight("bold")
               .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    for (var i = 1; i <= headers.length; i++) {
      sheet.setColumnWidth(i, 160);
    }
  }
  return sheet;
}

function createSuccessResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({
    result: "success",
    message: msg
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
