const fs = require('fs');
const file = 'd:/MunnaProjects/balal/src/app/(dashboard)/customers/[id]/edit/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regexMap = [
  {
    find: \`  const [loadingInitial, setLoadingInitial] = useState(true)
  const [name, setName] = useState('')
  const [mobile1, setMobile1] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [riskLevel, setRiskLevel] = useState<RiskLevelKey>('NEUTRAL')
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)\`,
    replace: \`  const [loadingInitial, setLoadingInitial] = useState(true)
  const [name, setName] = useState('')
  const [mobile1, setMobile1] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [riskLevel, setRiskLevel] = useState<RiskLevelKey>('NEUTRAL')
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null)

  const [mobile2, setMobile2] = useState('')
  const [mobile2Label, setMobile2Label] = useState('Father')
  const [mobile3, setMobile3] = useState('')
  const [mobile3Label, setMobile3Label] = useState('Mother')
  const [mobile4, setMobile4] = useState('')
  const [mobile4Label, setMobile4Label] = useState('Friend')
  const [showAdditionalMobiles, setShowAdditionalMobiles] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)\`
  },
  {
    find: \`        if (res.ok && json.data?.customer) {
          const c = json.data.customer
          setName(c.name || '')
          setMobile1(c.mobile1 || '')
          setAadhaar(c.aadhaar || '')
          setRiskLevel((c.risk_level as RiskLevelKey) || 'NEUTRAL')
          setExistingPhotoUrl(c.photo_url || null)
        } else {\`,
    replace: \`        if (res.ok && json.data?.customer) {
          const c = json.data.customer
          setName(c.name || '')
          setMobile1(c.mobile1 || '')
          setAadhaar(c.aadhaar || '')
          setRiskLevel((c.risk_level as RiskLevelKey) || 'NEUTRAL')
          setExistingPhotoUrl(c.photo_url || null)
          
          setMobile2(c.mobile2 || '')
          setMobile2Label(c.mobile2_label || 'Father')
          setMobile3(c.mobile3 || '')
          setMobile3Label(c.mobile3_label || 'Mother')
          setMobile4(c.mobile4 || '')
          setMobile4Label(c.mobile4_label || 'Friend')
          if (c.mobile2 || c.mobile3 || c.mobile4) {
             setShowAdditionalMobiles(true)
          }
        } else {\`
  },
  {
    find: \`      const updateRes = await fetch(\\\`/api/customers/\\\${customerId}\\\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          mobile1: trimmedMobile1,
          aadhaar: aadhaar.trim() ? aadhaar.trim() : undefined,
          risk_level: riskLevel,
          photo_url: finalPhotoUrl,
        }),
      })\`,
    replace: \`      const updateRes = await fetch(\\\`/api/customers/\\\${customerId}\\\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          mobile1: trimmedMobile1,
          aadhaar: aadhaar.trim() ? aadhaar.trim() : undefined,
          risk_level: riskLevel,
          photo_url: finalPhotoUrl,
          mobile2: mobile2.trim() ? mobile2.trim() : undefined,
          mobile2_label: mobile2Label.trim() ? mobile2Label.trim() : undefined,
          mobile3: mobile3.trim() ? mobile3.trim() : undefined,
          mobile3_label: mobile3Label.trim() ? mobile3Label.trim() : undefined,
          mobile4: mobile4.trim() ? mobile4.trim() : undefined,
          mobile4_label: mobile4Label.trim() ? mobile4Label.trim() : undefined,
        }),
      })\`
  },
  {
    find: \`            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customer-aadhaar">Aadhaar (optional)</Label>
                <Input
                  id="customer-aadhaar"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Risk level</Label>
                <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevelKey)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(RISK_LEVELS) as RiskLevelKey[]).map((key) => {
                      const r = RISK_LEVELS[key]
                      return (
                        <SelectItem key={key} value={key}>
                          <span className={\\\`inline-flex items-center gap-2\\\`}>
                            <span className={\\\`size-2 rounded-full \\\${r.color.replace('bg-', 'bg-')}\\\`} />
                            {r.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}\`,
    replace: \`            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customer-aadhaar">Aadhaar (optional)</Label>
                <Input
                  id="customer-aadhaar"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Risk level</Label>
                <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevelKey)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(RISK_LEVELS) as RiskLevelKey[]).map((key) => {
                      const r = RISK_LEVELS[key]
                      return (
                        <SelectItem key={key} value={key}>
                          <span className={\\\`inline-flex items-center gap-2\\\`}>
                            <span className={\\\`size-2 rounded-full \\\${r.color.replace('bg-', 'bg-')}\\\`} />
                            {r.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5 border p-3 rounded-md bg-muted/20">
              <div className="flex items-center justify-between pb-2 border-b">
                <Label className="text-base font-medium">Additional Mobile Numbers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdditionalMobiles(!showAdditionalMobiles)}
                >
                  {showAdditionalMobiles ? 'Hide' : 'Add'} Numbers
                </Button>
              </div>
              
              {showAdditionalMobiles && (
                <div className="grid gap-4 sm:grid-cols-2 pt-3">
                  <div className="space-y-1.5">
                    <Label>Mobile 2 (Optional)</Label>
                    <div className="flex gap-2">
                      <Select value={mobile2Label} onValueChange={setMobile2Label}>
                        <SelectTrigger className="w-[110px] shrink-0">
                          <SelectValue placeholder="Label" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={mobile2}
                        onChange={(e) => setMobile2(e.target.value)}
                        inputMode="numeric"
                        placeholder="10-digit mobile"
                        className="flex-1 min-w-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Mobile 3 (Optional)</Label>
                    <div className="flex gap-2">
                      <Select value={mobile3Label} onValueChange={setMobile3Label}>
                        <SelectTrigger className="w-[110px] shrink-0">
                          <SelectValue placeholder="Label" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={mobile3}
                        onChange={(e) => setMobile3(e.target.value)}
                        inputMode="numeric"
                        placeholder="10-digit mobile"
                        className="flex-1 min-w-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Mobile 4 (Optional)</Label>
                    <div className="flex gap-2 sm:w-[calc(50%-0.5rem)]">
                      <Select value={mobile4Label} onValueChange={setMobile4Label}>
                        <SelectTrigger className="w-[110px] shrink-0">
                          <SelectValue placeholder="Label" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={mobile4}
                        onChange={(e) => setMobile4(e.target.value)}
                        inputMode="numeric"
                        placeholder="10-digit mobile"
                        className="flex-1 min-w-0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}\`
  }
];

let replaced = 0;
for (const {find, replace} of regexMap) {
  if (content.includes(find)) {
    content = content.replace(find, replace);
    replaced++;
  } else if (content.includes(find.replace(/\\n/g, '\\r\\n'))) {
    content = content.replace(find.replace(/\\n/g, '\\r\\n'), replace.replace(/\\n/g, '\\r\\n'));
    replaced++;
  } else {
    // try to match without newlines to find it loosely
    const cleanFind = find.replace(/\\s+/g, '');
    const cleanContent = content.replace(/\\s+/g, '');
    if (cleanContent.includes(cleanFind)) {
      console.log('Match found if spaces ignoring, meaning line endings differ.');
      // build a regex to overcome newlines
      const rx = new RegExp(find.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\n/g, '\\\\r?\\\\n'), 'g');
      if (rx.test(content)) {
         content = content.replace(rx, replace.replace(/\\n/g, '\\r\\n')); // Output \r\n to match Windows file style
         replaced++;
      } else {
         console.error('Regex still failed for:', find.substring(0, 50));
      }
    } else {
      console.error('Could not find even without whitespace:', find.substring(0, 50));
    }
  }
}

fs.writeFileSync(file, content);
console.log('Done, replaced', replaced, 'chunks');
