# office 老格式转换辅助脚本（由 Node 调用，仅用于 .doc / .ppt 解析）
param(
    [Parameter(Mandatory = $true)][string]$In,
    [Parameter(Mandatory = $true)][string]$Out,
    [Parameter(Mandatory = $true)][string]$Kind
)

$ErrorActionPreference = "Stop"

if ($Kind -eq "word") {
    $app = New-Object -ComObject Word.Application
    $app.Visible = $false
    $app.DisplayAlerts = 0
    $doc = $app.Documents.Open($In, $false, $true)
    $doc.SaveAs2($Out, 16)
    $doc.Close(0)
    $app.Quit()
} else {
    $app = New-Object -ComObject PowerPoint.Application
    $pres = $app.Presentations.Open($In, $true, $false, $false)
    $pres.SaveAs($Out, 24)
    $pres.Close()
    $app.Quit()
}

Write-Output "converted"
