# `src` 폴더 구조 안내

프로젝트의 핵심 소스 코드가 위치하는 `src` 폴더는 다음과 같이 구성되어 있습니다.

---

## apis

- 서버 API 호출과 관련된 함수 및 서비스 모듈들
- REST API, GraphQL 클라이언트, 요청 래퍼 등

## app

- Next.js App Router 기반 페이지 및 레이아웃 관련 코드
- `app/layout.tsx`, `app/page.tsx` 등 페이지와 라우트 컴포넌트 포함

## assets

- 이미지, 폰트, 아이콘, 정적 리소스 등
- 프로젝트 내에서 사용하는 모든 정적 파일

## components

- 재사용 가능한 UI 컴포넌트 모음
- `common`, `form`, `layout`, `ui` 등 역할별 하위 폴더 포함

## stores

- 상태 관리 로직 (Redux, Zustand, Recoil 등)
- 글로벌 또는 도메인별 상태 모듈

## styles

- 전역 스타일, CSS 모듈, Tailwind 설정 등 스타일 관련 코드
- `globals.css`, 테마 관련 파일 포함

## types

- 타입스크립트 인터페이스, 타입 선언 모음
- 전역 타입, API 응답 타입 등

## utils

- 공통 유틸리티 함수 및 헬퍼
- 날짜 포맷팅, 데이터 가공 함수 등

---
