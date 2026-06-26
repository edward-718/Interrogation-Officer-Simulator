# Simple HTTP server for static files (ASCII only, no Chinese chars)
Add-Type -AssemblyName System

$PORT = 8080
$root = 'c:\Trae\审讯demo'

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.ico'  = 'image/x-icon'
    '.md'   = 'text/markdown; charset=utf-8'
    '.txt'  = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:' + $PORT + '/')

try {
    $listener.Start()
    Write-Host ''
    Write-Host '  Server running' -ForegroundColor Green
    Write-Host '  Local:   http://localhost:'$PORT'/' -ForegroundColor Cyan
    Write-Host '  Network: http://127.0.0.1:'$PORT'/' -ForegroundColor Cyan
    Write-Host ''
    Write-Host '  Press Ctrl+C to stop' -ForegroundColor Yellow
    Write-Host ''
} catch {
    Write-Host 'FAILED: port '$PORT' may be in use' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $rawUrl = $req.Url.AbsolutePath
        $url = [Uri]::UnescapeDataString($rawUrl)
        if ($url -eq '/' -or $url -eq '') { $url = '/index.html' }

        $relative = $url.TrimStart('/')
        $filePath = Join-Path $root $relative

        $fullResolved = [System.IO.Path]::GetFullPath($filePath)
        $rootResolved = [System.IO.Path]::GetFullPath($root)
        if (-not $fullResolved.StartsWith($rootResolved)) {
            $res.StatusCode = 403
            $errBuf = [System.Text.Encoding]::UTF8.GetBytes('<html><body><h1>403 Forbidden</h1></body></html>')
            $res.ContentType = 'text/html; charset=utf-8'
            $res.ContentLength64 = $errBuf.Length
            $res.OutputStream.Write($errBuf, 0, $errBuf.Length)
            $res.Close()
            continue
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = 'application/octet-stream'
            if ($mime.ContainsKey($ext)) { $contentType = $mime[$ext] }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $res.ContentType = $contentType
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()

            $timestamp = Get-Date -Format 'HH:mm:ss'
            Write-Host '['$timestamp'] 200 '$url -ForegroundColor Green
        } else {
            $res.StatusCode = 404
            $errBuf = [System.Text.Encoding]::UTF8.GetBytes('<html><body><h1>404 Not Found</h1><p>' + $url + '</p></body></html>')
            $res.ContentType = 'text/html; charset=utf-8'
            $res.ContentLength64 = $errBuf.Length
            $res.OutputStream.Write($errBuf, 0, $errBuf.Length)
            $res.Close()

            $timestamp = Get-Date -Format 'HH:mm:ss'
            Write-Host '['$timestamp'] 404 '$url -ForegroundColor Yellow
        }
    } catch {
        Write-Host 'ERROR: '$_.Exception.Message -ForegroundColor Red
        try {
            if ($context.Response) {
                $context.Response.StatusCode = 500
                $context.Response.Close()
            }
        } catch {}
    }
}
