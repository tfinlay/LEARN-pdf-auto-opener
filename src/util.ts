export const getSyncSetting = async <T>(settingName: string, defaultValue: T): Promise<T | undefined> => {
  const res = await chrome.storage.sync.get(settingName)
  const shouldBind = res[settingName]

  return (shouldBind as T) ?? defaultValue
}

export const getLocalSetting = async <T>(settingName: string, defaultValue: T): Promise<T | undefined> => {
  const res = await chrome.storage.local.get(settingName)
  const shouldBind = res[settingName]

  return (shouldBind as T) ?? defaultValue
}
