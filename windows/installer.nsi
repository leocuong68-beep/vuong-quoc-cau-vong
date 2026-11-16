; Học viện — Windows installer (per user, no admin needed). Build: makensis installer.nsi
Unicode true
!include "MUI2.nsh"
Name "Học viện"
OutFile "dist\Hoc-vien-Setup-1.0.0.exe"
InstallDir "$LOCALAPPDATA\Programs\HocVien"
RequestExecutionLevel user
SetCompressor /SOLID lzma
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"
!define MUI_FINISHPAGE_RUN "$INSTDIR\Hoc vien.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Mở Học viện"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Vietnamese"
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "dist\win-unpacked\*.*"
  File "icon.ico"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateShortCut "$DESKTOP\Học viện.lnk" "$INSTDIR\Hoc vien.exe" "" "$INSTDIR\icon.ico"
  CreateDirectory "$SMPROGRAMS\Học viện"
  CreateShortCut "$SMPROGRAMS\Học viện\Học viện.lnk" "$INSTDIR\Hoc vien.exe" "" "$INSTDIR\icon.ico"
  CreateShortCut "$SMPROGRAMS\Học viện\Gỡ cài đặt.lnk" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HocVien" "DisplayName" "Học viện"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HocVien" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HocVien" "DisplayIcon" "$INSTDIR\icon.ico"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HocVien" "Publisher" "Leo Cuong"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HocVien" "DisplayVersion" "1.0.0"
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\Học viện.lnk"
  RMDir /r "$SMPROGRAMS\Học viện"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HocVien"
SectionEnd
