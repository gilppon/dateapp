# -*- coding: utf-8 -*-
import subprocess
import sys
import os

def run_command(command, description):
    print(f"\n[RUNNING] {description}...")
    print(f"   Command: {command}")
    
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"[SUCCESS] {description} 통과!")
        return True, result.stdout
    else:
        print(f"[FAILURE] {description} 실패!")
        print(f"--- ERROR LOG ---")
        print(result.stdout)
        print(result.stderr)
        print(f"-----------------")
        return False, result.stderr

def main():
    # Windows 콘솔 인코딩 대응을 위해 stdout 인코딩 재설정 시도
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass # 구형 python 버전 예외 방지

    print("====================================================")
    print("SOP - korea aimasu Backend Integration Verification Gate")
    print("====================================================")
    
    # 1단계: TypeScript 정적 컴파일 빌드 검사
    build_success, build_log = run_command("npm run build", "TypeScript 소스코드 정적 빌드 검증")
    if not build_success:
        print("\n[Verification Blocked] 빌드 실패로 인해 검증을 조기 종료합니다.")
        sys.exit(1)
        
    # 2단계: 16kHz PCM WebSocket 오디오 릴레이 지연 속도 검증 (E2E RTT 테스트)
    latency_success, latency_log = run_command("npx ts-node tests/latencyTest.ts", "16kHz PCM 오디오 릴레이 RTT 지연 실사 검증 (E2E)")
    if not latency_success:
        print("\n[Verification Blocked] 지연 속도 검증 실패!")
        sys.exit(1)
        
    # 3단계: AI 안전 가드 및 자동 차단 비즈니스 시나리오 검사 (E2E 가드 테스트)
    guard_success, guard_log = run_command("npx ts-node tests/aiGuardTest.ts", "AI 가드 탐지 및 스캠 스코어 자동 BAN 시나리오 검증 (E2E)")
    if not guard_success:
        print("\n[Verification Blocked] AI 가드 시나리오 검증 실패!")
        sys.exit(1)
        
    print("\n====================================================")
    print("[ALL PASS] 모든 Verification SOP 게이트를 성공적으로 통과했습니다!")
    print("   - 빌드 무결성: OK")
    print("   - RTT 레이턴시: OK (< 50ms)")
    print("   - AI 가드 격리 징계: OK")
    print("====================================================")
    sys.exit(0)

if __name__ == "__main__":
    main()
