Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File ""C:\Users\eliyanah\OneDrive\Desktop\cloud app\launcher.ps1""", 0, False
Set WshShell = Nothing
