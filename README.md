# discordGambleBot2

TODO
1. 변경중인 스펙`(진행중)`
    1. 관심사 분리에 따른 클래스 전체적으로 수정
    - Model: Repository
    - Service: 비지니스 로직 + DB 상호작용
    - Controller: Array< 비지니스 로직 > & Input 데이터를 비지니스 로직에 전달
   
2. 유연성 증가 및 테스트 코드 작성을 편하게 하기 위한 DI(의존성 주입) 라이브러리 추가`(진행중)`
    1. Inversify Library
3. DB에 저장하고 있는 데이터는 싱글톤 객체에 할당하지 않게끔 변경 중`(진행중)`
