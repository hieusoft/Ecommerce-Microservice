using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User
{
    public class PagedResponse<T>
    {
        public IEnumerable<T> Data { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }

        public PagedResponse(IEnumerable<T> data, int page, int limit, int totalItems)
        {
            Data = data;
            Page = page;
            Limit = limit;
            TotalItems = totalItems;
            TotalPages = (int)Math.Ceiling(totalItems / (double)limit);
        }
    }

}
