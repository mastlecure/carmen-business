-- Productos (para ambos negocios)
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  buy_price numeric(10,2) default 0,
  sell_price numeric(10,2) not null,
  stock integer not null default 0,
  business text not null check (business in ('variedades', 'salon')),
  low_stock_alert integer default 3,
  created_at timestamptz default now()
);

-- Ventas (cabecera)
create table sales (
  id uuid primary key default gen_random_uuid(),
  business text not null check (business in ('variedades', 'salon')),
  total numeric(10,2) not null,
  notes text,
  created_at timestamptz default now()
);

-- Ítems de cada venta
create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  quantity integer not null,
  unit_price numeric(10,2) not null
);

-- Clientes del salón
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  birthday date,
  notes text,
  created_at timestamptz default now()
);

-- Servicios del salón
create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null,
  duration_minutes integer default 60,
  active boolean default true,
  created_at timestamptz default now()
);

-- Citas del salón
create table appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  client_name text not null,
  service_id uuid references services(id),
  service_name text not null,
  service_price numeric(10,2) not null,
  appointment_date date not null,
  appointment_time time not null,
  status text default 'pending' check (status in ('pending','confirmed','done','cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- Caja diaria
create table cash_register (
  id uuid primary key default gen_random_uuid(),
  business text not null check (business in ('variedades', 'salon')),
  register_date date not null default current_date,
  total_sales numeric(10,2) default 0,
  notes text,
  unique(business, register_date)
);

-- Habilitar RLS
alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table clients enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;
alter table cash_register enable row level security;

create policy "Allow all for authenticated" on products for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on sales for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on sale_items for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on clients for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on services for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on appointments for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on cash_register for all using (auth.role() = 'authenticated');
