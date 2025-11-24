// 디바이스 ID 생성 및 관리
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server"

  let deviceId = localStorage.getItem("deviceId")

  if (!deviceId) {
    deviceId = "device_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
    localStorage.setItem("deviceId", deviceId)
  }

  return deviceId
}

export function isAdmin(): boolean {
  // TODO: 실제 인증 로직 구현
  return localStorage.getItem("isAdmin") === "true"
}

export function setAdminStatus(status: boolean): void {
  localStorage.setItem("isAdmin", status.toString())
}
