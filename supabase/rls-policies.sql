-- Enable RLS on all tables
ALTER TABLE "Tenant"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Shop"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sale"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Advance"  ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's tenant id
CREATE OR REPLACE FUNCTION get_tenant_id()
RETURNS uuid AS $$
  SELECT id FROM "Tenant" WHERE supabase_user_id = auth.uid()::text
$$ LANGUAGE sql SECURITY DEFINER;

-- Tenant
CREATE POLICY "tenant_select" ON "Tenant" FOR SELECT USING (supabase_user_id = auth.uid()::text);
CREATE POLICY "tenant_insert" ON "Tenant" FOR INSERT WITH CHECK (supabase_user_id = auth.uid()::text);
CREATE POLICY "tenant_update" ON "Tenant" FOR UPDATE USING (supabase_user_id = auth.uid()::text);

-- Shop
CREATE POLICY "shop_select" ON "Shop" FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "shop_insert" ON "Shop" FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
CREATE POLICY "shop_update" ON "Shop" FOR UPDATE USING (tenant_id = get_tenant_id());
CREATE POLICY "shop_delete" ON "Shop" FOR DELETE USING (tenant_id = get_tenant_id());

-- Customer
CREATE POLICY "customer_select" ON "Customer" FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "customer_insert" ON "Customer" FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
CREATE POLICY "customer_update" ON "Customer" FOR UPDATE USING (tenant_id = get_tenant_id());
CREATE POLICY "customer_delete" ON "Customer" FOR DELETE USING (tenant_id = get_tenant_id());

-- Sale
CREATE POLICY "sale_select" ON "Sale" FOR SELECT USING (
  shop_id IN (SELECT id FROM "Shop" WHERE tenant_id = get_tenant_id())
);
CREATE POLICY "sale_insert" ON "Sale" FOR INSERT WITH CHECK (
  shop_id IN (SELECT id FROM "Shop" WHERE tenant_id = get_tenant_id())
);
CREATE POLICY "sale_update" ON "Sale" FOR UPDATE USING (
  shop_id IN (SELECT id FROM "Shop" WHERE tenant_id = get_tenant_id())
);
CREATE POLICY "sale_delete" ON "Sale" FOR DELETE USING (
  shop_id IN (SELECT id FROM "Shop" WHERE tenant_id = get_tenant_id())
);

-- Advance
CREATE POLICY "advance_select" ON "Advance" FOR SELECT USING (
  shop_id IN (SELECT id FROM "Shop" WHERE tenant_id = get_tenant_id())
);
CREATE POLICY "advance_insert" ON "Advance" FOR INSERT WITH CHECK (
  shop_id IN (SELECT id FROM "Shop" WHERE tenant_id = get_tenant_id())
);
CREATE POLICY "advance_update" ON "Advance" FOR UPDATE USING (
  shop_id IN (SELECT id FROM "Shop" WHERE tenant_id = get_tenant_id())
);
CREATE POLICY "advance_delete" ON "Advance" FOR DELETE USING (
  shop_id IN (SELECT id FROM "Shop" WHERE tenant_id = get_tenant_id())
);
