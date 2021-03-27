const data = `01-May-20,58.13
30-Apr-20,53.98
27-Apr-20,67.00
26-Apr-20,89.70
25-Apr-20,99.00
24-Apr-20,130.28
23-Apr-20,166.70
20-Apr-20,234.98
19-Apr-20,345.44
18-Apr-20,443.34
17-Apr-20,543.70
16-Apr-20,580.13
13-Apr-20,605.23
12-Apr-20,622.77
11-Apr-20,626.20
10-Apr-20,628.44`;

export interface IDateAmount {
    date: Date | null;
    close: number;
}

export default data;
