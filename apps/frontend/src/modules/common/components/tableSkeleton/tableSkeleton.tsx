interface TableSkeletonProps {
  headers: string[];
  amountOfRows: number;
}

export function TableSkeleton({ headers, amountOfRows }: TableSkeletonProps): JSX.Element {
  return (
    <table>
      <thead className="w-full grid auto-cols-auto">
        <tr className="w-full">
          {headers.map((header, index) => (
            <th
              className="w-[20%]"
              key={index}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-blue-500 grid auto-rows-auto">
        {Array.from({ length: amountOfRows }).map((_, index) => (
          <tr key={`skeletonTableRow-${index}`}>
            {headers.map((_, index) => (
              <td key={`skeletonTableCell${index}`}>Loading...</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
