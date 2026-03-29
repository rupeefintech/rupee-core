export function generateSEO(type: 'bank' | 'state' | 'city' | 'ifsc', data: any) {
    switch (type) {
  
      case 'bank':
        return {
          title: `${data.bank} IFSC Code List – All Branches in India`,
          description: `Find all IFSC codes of ${data.bank} with branch details, MICR, and locations across India.`,
        };
  
      case 'state':
        return {
          title: `${data.bank} IFSC Code in ${data.state} – All Branches`,
          description: `Find ${data.bank} IFSC codes in ${data.state} with branch address, MICR, and bank details.`,
        };
  
      case 'city':
        return {
          title: `${data.bank} IFSC Code in ${data.city} ${data.state}`,
          description: `Search ${data.bank} IFSC codes in ${data.city}, ${data.state}. View all branches with IFSC, MICR, and address.`,
        };
  
      case 'ifsc':
        return {
          title: `${data.ifsc} IFSC Code – ${data.bank} ${data.branch} ${data.city}`,
          description: `Get IFSC Code ${data.ifsc} of ${data.bank} ${data.branch}, ${data.city} with address, MICR, and NEFT/RTGS details.`,
        };
  
      default:
        return { title: '', description: '' };
    }
  }