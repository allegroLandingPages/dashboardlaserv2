export const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  
  export const formatDateBr = (dateObj) => {
    if (!dateObj) return '';
    return dateObj.toLocaleDateString('pt-BR');
  };
  
  export const resolveProductCode = (inputStr, dataset) => {
    if (!inputStr) return null;
    const upperInput = String(inputStr).trim().toUpperCase();
    
    let match = dataset.find(item => item.code.toUpperCase() === upperInput);
    
    if (!match && upperInput.includes(' - ')) {
      const extractedCode = upperInput.split(' - ')[0].trim();
      match = dataset.find(item => item.code.toUpperCase() === extractedCode);
    }
    
    if (!match) {
      match = dataset.find(item => item.name.toUpperCase().includes(upperInput));
    }
  
    return match ? match.code : String(inputStr).trim(); 
  };