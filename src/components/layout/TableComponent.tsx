'use client';

import React from 'react';

// Define TypeScript interfaces for props
interface Column {
  header: string;
  render: (item: any) => React.ReactNode;
}

interface AdditionalAction {
  label: string;
  action: (item: any) => void;
  icon?: string | React.ReactNode; // ✅ Updated to allow string or React.ReactNode
}

interface TableComponentProps {
  data: any[];
  columns: Column[];
  loading: boolean;
  error: string | null;
  selectedItems: any[];
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>, id: any) => void;
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (item: any) => void;
  onDelete: (id: any) => void;
  onView?: (item: any) => void;
  idField?: string;
  additionalActions?: AdditionalAction[];
}

const TableComponent: React.FC<TableComponentProps> = ({
  data,
  columns,
  loading,
  error,
  selectedItems,
  handleCheckboxChange,
  handleSelectAll,
  onEdit,
  onDelete,
  onView,
  idField = 'id',
  additionalActions = []
}) => {
  return (
    <div className="flex-1 overflow-auto border rounded-lg shadow-md">
      <table className="table table-zebra w-full">
        <thead className="sticky top-0 shadow-md z-30 bg-base-100">
          <tr>
            <th className="sticky left-0 bg-base-100">
              <label>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selectedItems.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                />
              </label>
            </th>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`${index === 0 ? 'bg-base-100' : ''}`}
              >
                {column.header}
              </th>
            ))}
            <th className="bg-base-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + 2} className="text-center py-4">
                Chargement...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length + 2} className="text-center py-4 text-red-500">
                {error}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} className="text-center py-4">
                Aucun élément trouvé.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item[idField]}>
                <th className="sticky left-0 z-10 bg-base-100">
                  <label>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedItems.includes(item[idField])}
                      onChange={(e) => handleCheckboxChange(e, item[idField])}
                    />
                  </label>
                </th>
                {columns.map((column, index) => (
                  <td key={index}>{column.render(item)}</td>
                ))}
                <th>
                  <div className="flex gap-2">
                    <button className="btn btn-warning btn-xs" onClick={() => onEdit(item)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      className="btn btn-error btn-xs"
                      onClick={() => onDelete(item[idField])}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    {onView && (
                      <button
                        className="btn btn-info btn-xs"
                        onClick={() => onView(item)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}
                    {additionalActions.map((action, index) => (
                      <button
                        key={index}
                        className="btn btn-secondary btn-xs"
                        onClick={() => action.action(item)}
                        title={action.label}
                      >
                        {typeof action.icon === 'string' ? (
                          <span>{action.icon}</span>
                        ) : (
                          action.icon || (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          )
                        )}
                      </button>
                    ))}
                  </div>
                </th>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="sticky bottom-0 shadow-md z-30 bg-base-100">
          <tr>
            <th className="sticky left-0 bg-base-100"></th>
            {columns.map((column, index) => (
              <th key={index} className="bg-base-100">
                {column.header}
              </th>
            ))}
            <th className="bg-base-100"></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default TableComponent;