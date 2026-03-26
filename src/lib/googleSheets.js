export const fetchTeamMembers = async () => {
  const SHEET_ID = '1Y_bIm9ybI2Qa8bI6ytzkpQW8d_EnFdCQ8tmi8_K8IIE';
  const GID = '1618236588';
  const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

  try {
    const response = await fetch(URL);
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length <= 1) return [];

    // Column B (Mail) from each row, skipping header
    return lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { values.push(current.trim().replace(/^"|"$/g, '')); current = ''; }
        else current += char;
      }
      values.push(current.trim().replace(/^"|"$/g, ''));
      return values[1] || ''; // Column B (Mail)
    }).filter(Boolean);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
};

export const fetchLeads = async () => {
  const SHEET_ID = '1Y_bIm9ybI2Qa8bI6ytzkpQW8d_EnFdCQ8tmi8_K8IIE';
  const GID = '425565305';
  const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

  try {
    const response = await fetch(URL);
    const csvText = await response.text();
    
    // Simple CSV parser that handles basic cases
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const data = lines.slice(1).map(line => {
      // Handle commas inside quotes
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));

      return headers.reduce((obj, header, i) => {
        obj[header] = values[i] || '';
        return obj;
      }, {});
    });

    return data;
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
};
