export interface ClinicRepository {
  findFirst(): Promise<{ id: string } | null>;
}
