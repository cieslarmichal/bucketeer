import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../../../components/ui/pagination";
import { FC } from "react";


interface TablePaginationProps {
    current: number;
    last: number;
}
export const TablePagination: FC<TablePaginationProps> = ({ current, last }) => {
    const navigate = useNavigate();
    const search = useSearch({ from: '/dashboard/'});
  
    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
  
      for (let i = 1; i <= last; i++) {
        if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
          range.push(i);
        }
      }
  
      let l;
      for (const i of range) {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      }
  
      return rangeWithDots;
    };
  
    const handlePageChange = (page: number) => {
      navigate({
        search: (prev) => ({ ...prev, page: page }),
      });
    };
  
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Link
              search={{ ...search, page: Math.max(1, current - 1) }}
            >
              <PaginationPrevious onClick={() => handlePageChange(Math.max(1, current - 1))} />
            </Link>
          </PaginationItem>
          {getPageNumbers().map((pageNumber, index) => (
            <PaginationItem key={index}>
              {pageNumber === '...' ? (
                <PaginationEllipsis />
              ) : (
                <Link
                  search={{ ...search, page: pageNumber as number }}
                >
                  <PaginationLink
                    isActive={current === pageNumber}
                    onClick={() => handlePageChange(pageNumber as number)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </Link>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <Link
              search={{ ...search, page: Math.min(last, current + 1) }}
            >
              <PaginationNext onClick={() => handlePageChange(Math.min(last, current + 1))} />
            </Link>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
};
