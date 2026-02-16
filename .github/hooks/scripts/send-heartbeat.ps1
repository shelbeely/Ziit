# send-heartbeat.ps1 - Helper script to send heartbeat to Ziit API

# Read configuration from environment or use defaults
$ZiitApiUrl = if ($env:ZIIT_API_URL) { $env:ZIIT_API_URL } else { "https://ziit.app" }
$ZiitApiKey = if ($env:ZIIT_API_KEY) { $env:ZIIT_API_KEY } else { "" }

function Send-Heartbeat {
    param(
        [Parameter(Mandatory=$true)]
        [long]$Timestamp,
        
        [Parameter(Mandatory=$true)]
        [string]$EventType,
        
        [Parameter(Mandatory=$false)]
        [string]$ToolName = "",
        
        [Parameter(Mandatory=$false)]
        [string]$Metadata = "{}"
    )
    
    # Skip if no API key is configured
    if ([string]::IsNullOrEmpty($ZiitApiKey)) {
        return
    }
    
    # Get current working directory and other info
    $cwd = Get-Location
    $projectName = Split-Path -Leaf $cwd
    $editor = "GitHub Copilot Agent"
    $osName = [System.Environment]::OSVersion.Platform
    
    # Construct heartbeat payload
    $payload = @{
        timestamp = $Timestamp
        project = $projectName
        language = "Unknown"
        editor = $editor
        os = $osName
        file = "copilot-agent"
        category = "copilot-agent"
        eventType = $EventType
        toolName = $ToolName
        metadata = $Metadata | ConvertFrom-Json
    } | ConvertTo-Json -Compress
    
    # Send to API (silently, don't block on errors)
    try {
        $headers = @{
            "Authorization" = "Bearer $ZiitApiKey"
            "Content-Type" = "application/json"
        }
        Invoke-RestMethod -Uri "$ZiitApiUrl/api/external/heartbeat" -Method Post -Headers $headers -Body $payload -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-Null
    } catch {
        # Silently ignore errors
    }
}

Export-ModuleMember -Function Send-Heartbeat
