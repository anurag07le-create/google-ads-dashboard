import { fetchLeads } from './src/lib/googleSheets.js';

async function checkData() {
    try {
        const leads = await fetchLeads();
        const assignees = [...new Set(leads.map(l => l['Assigned to']))];
        console.log('Unique Assignees:', assignees);
        console.log('Sample Lead:', leads[0]);
    } catch (e) {
        console.error(e);
    }
}

checkData();
