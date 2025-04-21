// 전역 변수
let isGoogleApiReady = false;
let isSignedIn = false;
let currentSpreadsheetId = '';
let records = [];

// DOM 요소
document.addEventListener('DOMContentLoaded', function() {
  // 초기화
  initApp();
  
  // 이벤트 리스너 설정
  setupEventListeners();
  
  // 반 옵션 생성
  generateClassOptions();
  
  // 날짜 기본값 설정
  setDefaultDate();
  
  // 파일명 미리보기 업데이트
  updateFilenamePreview();
});

// 앱 초기화
function initApp() {
  // 구글 API 초기화 (시뮬레이션)
  simulateGoogleApiLoad();
  
  // 로컬 스토리지에서 저장된 기록 불러오기
  loadRecordsFromStorage();
  
  // 기록 테이블 업데이트
  updateRecordsTable();
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 구글 로그인 버튼
  document.getElementById('btn-google-auth').addEventListener('click', handleGoogleAuth);
  
  // 폼 제출
  document.getElementById('class-form').addEventListener('submit', handleFormSubmit);
  
  // 초기화 버튼
  document.getElementById('btn-reset').addEventListener('click', resetForm);
  
  // 새 기록 작성 버튼
  document.getElementById('btn-new-record').addEventListener('click', showNewRecordForm);
  
  // 스프레드시트 열기 버튼
  document.getElementById('btn-open-spreadsheet').addEventListener('click', function() {
    openSpreadsheet(currentSpreadsheetId);
  });
  
  // 반과 날짜 선택 변경 시 파일명 업데이트
  document.getElementById('class-select').addEventListener('change', updateFilenamePreview);
  document.getElementById('class-date').addEventListener('change', updateFilenamePreview);
}

// 반 옵션 생성
function generateClassOptions() {
  const classSelect = document.getElementById('class-select');
  const classCount = 11;
  
  for (let i = 1; i <= classCount; i++) {
    const option = document.createElement('option');
    option.value = `${i}반`;
    option.textContent = `${i}반`;
    classSelect.appendChild(option);
  }
}

// 오늘 날짜를 기본값으로 설정
function setDefaultDate() {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  document.getElementById('class-date').value = dateString;
}

// 파일명 미리보기 업데이트
function updateFilenamePreview() {
  const classSelect = document.getElementById('class-select');
  const selectedClass = classSelect.value;
  const today = new Date();
  const dateStr = `${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
  
  const filenamePreview = document.getElementById('filename-preview');
  
  if (selectedClass) {
    filenamePreview.textContent = `수업기록_${selectedClass}_${dateStr}.xlsx`;
  } else {
    filenamePreview.textContent = '수업기록_반_YYYYMMDD.xlsx';
  }
}

// 구글 API 로드 시뮬레이션
function simulateGoogleApiLoad() {
  console.log("Google API 로드 시뮬레이션");
  setStatusMessage("Google API 로드 중...");
  
  // 1초 후 API 로드 완료 시뮬레이션
  setTimeout(() => {
    isGoogleApiReady = true;
    setStatusMessage("Google API 로드 완료");
  }, 1000);
}

// 구글 로그인/로그아웃 처리
function handleGoogleAuth() {
  const authButton = document.getElementById('btn-google-auth');
  const saveButton = document.getElementById('btn-save');
  const loginWarning = document.getElementById('login-warning');
  const loginStatus = document.getElementById('login-status');
  
  if (!isGoogleApiReady) {
    setStatusMessage("Google API가 아직 로드되지 않았습니다.");
    return;
  }
  
  if (isSignedIn) {
    // 로그아웃
    isSignedIn = false;
    authButton.textContent = "구글 계정으로 로그인";
    authButton.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    authButton.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    saveButton.disabled = true;
    loginWarning.classList.remove('hidden');
    loginStatus.innerHTML = '❌ 구글 계정에 연결되지 않았습니다. 저장하려면 로그인하세요.';
    setStatusMessage("로그아웃되었습니다.");
  } else {
    // 로그인 (시뮬레이션)
    setStatusMessage("구글 계정 로그인 중...");
    
    // 로그인 시뮬레이션 (1초 후)
    setTimeout(() => {
      isSignedIn = true;
      authButton.textContent = "로그아웃";
      authButton.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');
      authButton.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
      saveButton.disabled = false;
      loginWarning.classList.add('hidden');
      loginStatus.innerHTML = '✅ 구글 계정에 연결되었습니다. 수업 기록을 저장할 수 있습니다.';
      setStatusMessage("구글 계정에 로그인되었습니다.");
    }, 1000);
  }
}

// 폼 제출 처리
async function handleFormSubmit(e) {
  e.preventDefault();
  
  if (!isSignedIn) {
    setStatusMessage("Google 계정에 로그인해야 합니다.");
    return;
  }
  
  // 입력 값 가져오기
  const classDate = document.getElementById('class-date').value;
  const selectedClass = document.getElementById('class-select').value;
  const pageNumber = document.getElementById('page-number').value;
  const todayContent = document.getElementById('today-content').value;
  const nextContent = document.getElementById('next-content').value;
  const memo = document.getElementById('memo').value;
  
  // 유효성 검사
  if (!classDate || !selectedClass || !pageNumber || !todayContent || !nextContent) {
    setStatusMessage("모든 필수 필드를 입력해주세요.");
    return;
  }
  
  // 로딩 시작
  showLoading("저장 준비 중...");
  
  try {
    // 구글 스프레드시트에 저장 (시뮬레이션)
    const result = await saveToGoogleSheets(classDate, selectedClass, pageNumber, todayContent, nextContent, memo);
    
    if (result) {
      // 로컬 상태 업데이트
      const today = new Date();
      const newRecord = {
        id: Date.now(),
        class: selectedClass,
        classDate: classDate,
        page: pageNumber,
        todayContent,
        nextContent,
        memo,
        date: today.toLocaleDateString(),
        spreadsheetId: result.spreadsheetId
      };
      
      // 기록 배열에 추가
      records.unshift(newRecord);
      
      // 로컬 스토리지에 저장
      saveRecordsToStorage();
      
      // 성공 화면 표시
      showSuccessScreen(newRecord, result.fileName);
      
      // 기록 테이블 업데이트
      updateRecordsTable();
      
      // 현재 스프레드시트 ID 설정
      currentSpreadsheetId = result.spreadsheetId;
    }
  } catch (error) {
    console.error('저장 오류:', error);
    setStatusMessage(`저장 중 오류가 발생했습니다: ${error.message}`);
  } finally {
    // 로딩 종료
    hideLoading();
  }
}

// 저장 처리 (시뮬레이션)
async function saveToGoogleSheets(classDate, selectedClass, pageNumber, todayContent, nextContent, memo) {
  // 각 단계별 진행 상황 표시
  updateLoadingMessage("구글 드라이브 '수업기록' 폴더 확인 중...");
  await delay(800);
  
  updateLoadingMessage("수업기록 스프레드시트 생성 중...");
  await delay(800);
  
  updateLoadingMessage("데이터 저장 중...");
  await delay(1000);
  
  // 실제 저장 대신 랜덤 ID 생성하여 시뮬레이션
  const mockSpreadsheetId = 'sheet_' + Math.random().toString(36).substr(2, 9);
  
  // 파일명 생성
  const today = new Date();
  const dateStr = `${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
  const fileName = `수업기록_${selectedClass}_${dateStr}`;
  
  updateLoadingMessage("저장 완료!");
  await delay(500);
  
  return { 
    spreadsheetId: mockSpreadsheetId, 
    fileName: fileName
  };
}

// 성공 화면 표시
function showSuccessScreen(record, fileName) {
  // 입력 폼 숨기기
  document.getElementById('input-form-container').classList.add('hidden');
  
  // 성공 화면 표시
  const successContainer = document.getElementById('success-container');
  successContainer.classList.remove('hidden');
  
  // 저장된 정보 표시
  document.getElementById('saved-filename').textContent = `${fileName}.xlsx`;
  
  const classDateFormatted = new Date(record.classDate).toLocaleDateString();
  document.getElementById('saved-info').textContent = 
    `📆 ${classDateFormatted} | 🏫 ${record.class} | 📅 ${record.date}`;
  
  document.getElementById('saved-page').innerHTML = 
    `<span class="font-medium">📖 페이지:</span> ${record.page}`;
}

// 새 기록 작성 폼 표시
function showNewRecordForm() {
  // 성공 화면 숨기기
  document.getElementById('success-container').classList.add('hidden');
  
  // 입력 폼 표시
  document.getElementById('input-form-container').classList.remove('hidden');
  
  // 폼 초기화
  resetForm();
}

// 폼 초기화
function resetForm() {
  document.getElementById('class-select').value = '';
  setDefaultDate(); // 날짜는 오늘 날짜로 재설정
  document.getElementById('page-number').value = '';
  document.getElementById('today-content').value = '';
  document.getElementById('next-content').value = '';
  document.getElementById('memo').value = '';
  
  // 파일명 미리보기 업데이트
  updateFilenamePreview();
  
  // 상태 메시지 초기화
  setStatusMessage('');
}

// 스프레드시트 열기 (시뮬레이션)
function openSpreadsheet(spreadsheetId) {
  if (spreadsheetId) {
    alert(`스프레드시트를 여는 중입니다 (ID: ${spreadsheetId})`);
    // 실제 환경에서는: window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`, '_blank');
  } else {
    setStatusMessage('스프레드시트 ID를 찾을 수 없습니다.');
  }
}
// 기록 테이블 업데이트
function updateRecordsTable() {
  const recordsContainer = document.getElementById('records-container');
  const recordsList = document.getElementById('records-list');
  
  // 저장된 기록이 있으면 컨테이너 표시
  if (records.length > 0) {
    recordsContainer.classList.remove('hidden');
    
    // 테이블 내용 초기화
    recordsList.innerHTML = '';
    
    // 각 기록에 대한 행 추가
    records.forEach(record => {
      const row = document.createElement('tr');
      row.className = 'border-t border-gray-200 hover:bg-gray-50';
      
      // 수업일
      const classDateCell = document.createElement('td');
      classDateCell.className = 'py-2 px-4 text-gray-800';
      classDateCell.textContent = record.classDate ? new Date(record.classDate).toLocaleDateString() : '-';
      row.appendChild(classDateCell);
      
      // 반
      const classCell = document.createElement('td');
      classCell.className = 'py-2 px-4 text-gray-800';
      classCell.textContent = record.class;
      row.appendChild(classCell);
      
      // 기록일
      const dateCell = document.createElement('td');
      dateCell.className = 'py-2 px-4 text-gray-800';
      dateCell.textContent = record.date;
      row.appendChild(dateCell);
      
      // 페이지
      const pageCell = document.createElement('td');
      pageCell.className = 'py-2 px-4 text-gray-800';
      pageCell.textContent = record.page;
      row.appendChild(pageCell);
      
      // 상세보기 버튼
      const actionCell = document.createElement('td');
      actionCell.className = 'py-2 px-4';
      
      const viewButton = document.createElement('button');
      viewButton.className = 'text-indigo-600 hover:text-indigo-800 font-medium';
      viewButton.textContent = '보기';
      viewButton.addEventListener('click', () => openSpreadsheet(record.spreadsheetId));
      
      actionCell.appendChild(viewButton);
      row.appendChild(actionCell);
      
      // 행을 테이블에 추가
      recordsList.appendChild(row);
    });
  } else {
    // 기록이 없으면 컨테이너 숨기기
    recordsContainer.classList.add('hidden');
  }
}

// 로컬 스토리지에 기록 저장
function saveRecordsToStorage() {
  localStorage.setItem('classRecords', JSON.stringify(records));
}

// 로컬 스토리지에서 기록 불러오기
function loadRecordsFromStorage() {
  const storedRecords = localStorage.getItem('classRecords');
  if (storedRecords) {
    records = JSON.parse(storedRecords);
  }
}

// 상태 메시지 설정
function setStatusMessage(message) {
  const statusMessage = document.getElementById('status-message');
  statusMessage.textContent = message;
  
  // 메시지가 있으면 표시, 없으면 숨김
  if (message) {
    statusMessage.classList.remove('hidden');
  } else {
    statusMessage.classList.add('hidden');
  }
}

// 로딩 표시
function showLoading(message) {
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingMessage = document.getElementById('loading-message');
  
  loadingMessage.textContent = message || '로딩 중...';
  loadingOverlay.classList.remove('hidden');
}

// 로딩 숨김
function hideLoading() {
  const loadingOverlay = document.getElementById('loading-overlay');
  loadingOverlay.classList.add('hidden');
}

// 로딩 메시지 업데이트
function updateLoadingMessage(message) {
  const loadingMessage = document.getElementById('loading-message');
  loadingMessage.textContent = message;
}

// 지연 함수 (async/await와 함께 사용)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 날짜 형식 변환 (YYYY-MM-DD → 표시용 문자열)
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// 현재 날짜를 YYYY-MM-DD 형식의 문자열로 반환
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 파일명 생성 함수
function generateFilename(selectedClass) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
  
  return `수업기록_${selectedClass}_${dateStr}`;
}
