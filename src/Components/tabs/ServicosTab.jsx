import React from 'react';
import { formatCurrency } from '../../utils/helpers';
import TableSection from '../TableSection';

export default function ServicosTab({ salesData, printProps }) {
  const { servicePerformance } = salesData;

  if (servicePerformance.items.length === 0) {
    return <div className="card empty-chart"><p>Nenhum serviço financeiro encontrado no período.</p></div>;
  }

  // Basta configurar as colunas: Qual o título e qual chave do objeto ele lê!
  const columnsConfig = [
    { header: 'Código', accessor: 'code' },
    { header: 'Serviço / Item Financeiro', accessor: 'name', style: { fontWeight: 500 } },
    { header: 'Volume (Unidades)', accessor: 'totalQty' },
    { header: 'Receita Gerada', render: (row) => formatCurrency(row.totalRevenue), style: { fontWeight: 'bold', color: '#059669' } },
  ];

  return (
    <TableSection 
      id="servicos-det"
      title="Detalhamento: Serviços e Financeiro"
      data={servicePerformance.items}
      columns={columnsConfig}
      printProps={printProps}
      customStyle={{ border: '2px solid #f97316' }}
      titleColor="#c2410c"
    />
  );
}