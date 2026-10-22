# Tiny static file server for this folder: http://localhost:5173/ and http://<PC-IP>:5173/ on the same Wi-Fi
param([int]$Port = 5173)
$root = $PSScriptRoot
$types = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8';
  '.json'='application/json'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.svg'='image/svg+xml';
  '.webp'='image/webp'; '.glb'='model/gltf-binary'; '.ico'='image/x-icon' }
$listener = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Any), $Port
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/"
Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' } |
  ForEach-Object { Write-Host "On your phone (same Wi-Fi): http://$($_.IPAddress):$Port/" }
while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $client.ReceiveTimeout = 5000
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $line = $reader.ReadLine()
    while (($h = $reader.ReadLine()) -ne $null -and $h -ne '') { }
    $path = ''
    if ($line -match '^(GET|HEAD) (\S+)') { $path = [Uri]::UnescapeDataString(($Matches[2] -split '\?')[0].TrimStart('/')) }
    if ($path -eq '') { $path = 'index.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $root $path))
    if ($file.StartsWith($root) -and (Test-Path $file -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($file)
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $type = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
      $head = "HTTP/1.1 200 OK`r`nContent-Type: $type`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
    } else {
      $bytes = [Text.Encoding]::UTF8.GetBytes('Not found')
      $head = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
    }
    $hb = [Text.Encoding]::ASCII.GetBytes($head)
    $stream.Write($hb, 0, $hb.Length)
    if ($line -notmatch '^HEAD') { $stream.Write($bytes, 0, $bytes.Length) }
    $stream.Flush()
  } catch { } finally { $client.Close() }
}
