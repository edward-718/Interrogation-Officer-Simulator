$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()
Write-Host "Server running at http://localhost:8080/"
$root = 'c:\Trae\审讯demo'
$mime = @{
    '.html'='text/html; charset=utf-8'
    '.css'='text/css; charset=utf-8'
    '.js'='application/javascript; charset=utf-8'
    '.json'='application/json; charset=utf-8'
    '.svg'='image/svg+xml'
    '.png'='image/png'
    '.jpg'='image/jpeg'
    '.ico'='image/x-icon'
    '.md'='text/markdown; charset=utf-8'
}
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req = $context.Request
    $res = $context.Response
    $url = [System.Web.HttpUtility]::UrlDecode($req.Url.AbsolutePath)
    if ($url -eq '/') { $url = '/index.html' }
    $filePath = Join-Path $root $url.TrimStart('/')
    if (-not $filePath.StartsWith($root)) {
        $res.StatusCode = 403
        $buffer = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
        $res.OutputStream.Write($buffer, 0, $buffer.Length)
        $res.Close()
        continue
    }
    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $ct = 'application/octet-stream'
        if ($mime.ContainsKey($ext)) { $ct = $mime[$ext] }
        $res.ContentType = $ct
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        $res.Close()
    } else {
        $res.StatusCode = 404
        $res.ContentType = 'text/html; charset=utf-8'
        $buffer = [System.Text.Encoding]::UTF8.GetBytes('<h1>404 Not Found</h1>')
        $res.OutputStream.Write($buffer, 0, $buffer.Length)
        $res.Close()
    }
}
