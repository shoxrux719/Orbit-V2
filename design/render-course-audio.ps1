$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$plan = Get-Content '.vercel/course-media/plan.json' -Raw | ConvertFrom-Json
$output = Join-Path $PWD '.vercel/course-media'
$voice = [System.Speech.Synthesis.SpeechSynthesizer]::new()
$voice.SelectVoice('Microsoft Zira Desktop')
$voice.Rate = -1
$voice.Volume = 100
try {
  $count = 0
  foreach ($unit in $plan) {
    for ($i=0; $i -lt $unit.segments.Count; $i++) {
      $file = Join-Path $output ($unit.video + '-' + $i + '.wav')
      if (!(Test-Path -LiteralPath $file)) {
        $voice.SetOutputToWaveFile($file)
        $voice.Speak([string]$unit.segments[$i])
        $voice.SetOutputToNull()
      }
    }
    $storyFile = Join-Path $output ($unit.audio + '.wav')
    if (!(Test-Path -LiteralPath $storyFile)) {
      $voice.SetOutputToWaveFile($storyFile)
      $voice.Speak([string]$unit.story)
      $voice.SetOutputToNull()
    }
    $count++
    if ($count % 12 -eq 0) { Write-Output ('Narration prepared: ' + $count + '/' + $plan.Count) }
  }
} finally { $voice.Dispose() }
