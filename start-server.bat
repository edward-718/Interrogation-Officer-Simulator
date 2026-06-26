@echo off
REM Simple static server for Interrogation Room demo
cd /d "c:\Trae\审讯demo"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$listener = New-Object System.Net.HttpListener; ^
   $listener.Prefixes.Add('http://localhost:8080/'); ^
   $listener.Start(); ^
   Write-Host 'Server running at http://localhost:8080/'; ^
   Write-Host 'Press Ctrl+C to stop'; ^
   $root = 'c:\Trae\审讯demo'; ^
   $mime = @{'.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8'; '.json'='application/json; charset=utf-8'; '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.ico'='image/x-icon'; '.md'='text/markdown; charset=utf-8'; '.txt'='text/plain; charset=utf-8'}; ^
   while ($listener.IsListening) { ^
     $context = $listener.GetContext(); ^
     $req = $context.Request; ^
     $res = $context.Response; ^
     $url = [Uri]::UnescapeDataString($req.Url.AbsolutePath); ^
     if ($url -eq '/' -or $url -eq '') { $url = '/index.html' }; ^
     $filePath = Join-Path $root $url.TrimStart('/'); ^
     $fullResolved = [System.IO.Path]::GetFullPath($filePath); ^
     $rootResolved = [System.IO.Path]::GetFullPath($root); ^
     if (-not $fullResolved.StartsWith($rootResolved)) { ^
       $res.StatusCode = 403; $res.Close(); continue }; ^
     if (Test-Path $filePath -PathType Leaf) { ^
       $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); ^
       $ct = 'application/octet-stream'; ^
       if ($mime.ContainsKey($ext)) { $ct = $mime[$ext] }; ^
       $res.ContentType = $ct; ^
       $bytes = [System.IO.File]::ReadAllBytes($filePath); ^
       $res.ContentLength64 = $bytes.Length; ^
       $res.OutputStream.Write($bytes, 0, $bytes.Length); ^
       $res.Close(); ^
       Write-Host 'OK:' $url ^
     } else { ^
       $res.StatusCode = 404; ^
       $res.ContentType = 'text/html; charset=utf-8'; ^
       $buf = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found'); ^
       $res.ContentLength64 = $buf.Length; ^
       $res.OutputStream.Write($buf, 0, $buf.Length); ^
       $res.Close(); ^
       Write-Host '404:' $url ^
     } ^
   }"
