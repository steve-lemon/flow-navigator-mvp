import React, { createContext, useContext, useState } from 'react';

type Locale = 'ko' | 'en';

type Translations = Record<string, Record<string, string>>;

export const translations: Translations = {
  en: {
    'app.title': 'Flow Navigator',
    'nav.dashboard': 'Dashboard',
    'nav.items': 'Item Board',
    'nav.flows': 'Flow Manager',
    'nav.tools': 'Tool Manager',
    
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.all': 'All',
    'common.status': 'Status',
    'common.assignee': 'Assignee',
    'common.create': 'Create',
    
    'status.todo': 'Todo',
    'status.doing': 'Doing',
    'status.done': 'Done',
    'status.hold': 'Hold',
    'status.skip': 'Skip',
    'status.resume': 'Resume',
    'status.unassigned': 'Unassigned',
    'status.inactive': 'Inactive',
    
    'task.addTask': 'Add Task',
    'task.finishStage': 'Finish Stage',
    'task.markAsDone': 'Mark as Done',
    'task.addNote': 'Add Note',
    'task.noConnectedTool': 'No Tool Connected',
    'task.stereo.normal': 'Normal',
    'task.stereo.revision': 'Revision',
    'task.stereo.review': 'Review',
    'note.title': 'Notes ({count})',
    'note.reopen': 'Reopen',
    'note.resolve': 'Resolve',
    'note.placeholder': 'Leave a note...',
    'note.empty': 'No notes yet.',
    'note.stereo.comment': 'Comment',
    'note.stereo.request': 'Request',
    'note.stereo.issue': 'Issue',

    'item.create': 'Create New Item',
    'item.name': 'Item Name',
    'item.namePlace': 'e.g. Q3 Marketing Campaign',
    'item.priority': 'Priority',
    'item.priority.high': 'High',
    'item.priority.medium': 'Medium',
    'item.priority.low': 'Low',
    'item.size': 'Size',
    'item.size.large': 'Large',
    'item.size.medium': 'Medium',
    'item.size.small': 'Small',
    'item.selectFlow': 'Select Flow',
    'item.thumbnail': 'Thumbnail',
    'item.thumbnail.change': 'Change',
    'item.thumbnail.upload': 'Upload',
    'item.thumbnail.help': 'Or paste (Ctrl+V) / drag & drop an image anytime',
    'item.thumbnail.drop': 'Drop image here',
    
    'dashboard.title': 'My Tasks',
    'dashboard.doing': 'Doing',
    'dashboard.next': 'Next:',
    'dashboard.requests': 'Requests',
    'dashboard.progress': 'Complete',
    
    'itemboard.title': 'Active Items',
    'itemboard.newItem': 'New Item',
    'itemboard.empty': 'No items to display.',
    
    'itemdetail.back': 'Back to Items',
    'itemdetail.progress': 'Overall Progress',
    'itemdetail.reqAction': 'Requires Action',
    
    'stage.tasksCompleted': 'Tasks {completed}/{total} Completed',
    'stage.nextTask': 'Next Task',
    'stage.completed': 'All tasks are completed.',
    'stage.completeBtn': 'Complete Stage',
    
    'task.notConnected': 'Tool not connected',
    'task.noTasks': 'No tasks registered.',
    
    'tool.addTemplate': 'Add Task',
    'tool.stereo': 'Tool Type',
    'tool.actionLabel': 'Action Label',
    'tool.memo': 'Memo',
    
    'theme.dark': 'Dark Mode',
    'theme.light': 'Light Mode',
    'locale.ko': '한국어',
    'locale.en': 'English',
  },
  ko: {
    'app.title': 'Flow Navigator',
    'nav.dashboard': '대시보드',
    'nav.items': '아이템 보드',
    'nav.flows': 'Flow 관리',
    'nav.tools': '도구 관리',
    
    'common.add': '추가',
    'common.edit': '수정',
    'common.delete': '삭제',
    'common.save': '저장',
    'common.cancel': '취소',
    'common.close': '닫기',
    'common.all': '전체',
    'common.status': '상태 (STATUS)',
    'common.assignee': '담당자 (ASSIGNEE)',
    'common.create': '생성하기',
    
    'status.todo': '진행 전',
    'status.doing': '진행 중',
    'status.done': '완료',
    'status.hold': '보류',
    'status.skip': '스킵',
    'status.resume': '재개',
    'status.unassigned': '담당자 없음',
    'status.inactive': '비활성',
    
    'task.addTask': '작업 추가',
    'task.finishStage': '단계 완료 처리',
    'task.markAsDone': '완료 처리',
    'task.addNote': '코멘트 추가',
    'task.noConnectedTool': '도구 미연결',
    'task.stereo.normal': '일반',
    'task.stereo.revision': '수정',
    'task.stereo.review': '검토',
    'note.title': '노트 ({count})',
    'note.reopen': '다시 열기',
    'note.resolve': '해결 완료',
    'note.placeholder': '노트를 남겨주세요...',
    'note.empty': '등록된 노트가 없습니다.',
    'note.stereo.comment': '일반 코멘트',
    'note.stereo.request': '요청 사항',
    'note.stereo.issue': '이슈 보고',

    'item.create': '새 아이템 생성',
    'item.name': '아이템 이름',
    'item.namePlace': '예: Q3 마케팅 캠페인',
    'item.priority': '중요도',
    'item.priority.high': '높음',
    'item.priority.medium': '중간',
    'item.priority.low': '낮음',
    'item.size': '작업 규모',
    'item.size.large': '대 (Large)',
    'item.size.medium': '중 (Medium)',
    'item.size.small': '소 (Small)',
    'item.selectFlow': '작업 단계 (FLOW) 선택',
    'item.thumbnail': '썸네일',
    'item.thumbnail.change': '변경',
    'item.thumbnail.upload': '업로드',
    'item.thumbnail.help': '이미지를 붙여넣기 (Ctrl+V) 하거나 드래그 & 드롭하여 업로드할 수 있습니다',
    'item.thumbnail.drop': '여기에 이미지를 놓으세요',
    
    'dashboard.title': '내 작업 목록',
    'dashboard.doing': '진행중 작업',
    'dashboard.next': '다음 작업:',
    'dashboard.requests': '요청사항',
    'dashboard.progress': '완료',
    
    'itemboard.title': '진행중인 아이템',
    'itemboard.newItem': '새 아이템',
    'itemboard.empty': '표시할 아이템이 없습니다.',
    
    'itemdetail.back': '아이템 목록으로',
    'itemdetail.progress': '전체 진행률',
    'itemdetail.reqAction': '조치 필요',
    
    'stage.tasksCompleted': '작업 {completed}/{total} 완료',
    'stage.nextTask': '다음 작업',
    'stage.completed': '모든 작업이 완료되었습니다.',
    'stage.completeBtn': 'Stage 완료하기',
    
    'task.notConnected': '도구 미연결',
    'task.noTasks': '등록된 작업이 없습니다.',
    
    'tool.addTemplate': '작업 추가',
    'tool.stereo': '도구 유형',
    'tool.actionLabel': '액션 라벨',
    'tool.memo': '메모',
    
    'theme.dark': '다크 모드',
    'theme.light': '라이트 모드',
    'locale.ko': '한국어',
    'locale.en': 'English',
  }
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('locale') as Locale;
    return saved || 'ko';
  });

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[locale][key] || key;
    if (params) {
      Object.keys(params).forEach(k => {
        text = text.replace(`{${k}}`, String(params[k]));
      });
    }
    return text;
  };

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
};
