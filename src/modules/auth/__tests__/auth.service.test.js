// Unit tests for AuthService.register.
// The repository is mocked so no DB connection is needed.
// Pattern: Arrange → Act → Assert (AAA) on every test.

const { AuthService }   = require('../auth.service');
const { ConflictError } = require('../../../shared/app.error');

// ── Mock factory ─────────────────────────────────────────────────────────────
const makeRepo = (overrides = {}) => ({
  findByEmail: jest.fn().mockResolvedValue(null),
  findByPhone: jest.fn().mockResolvedValue(null),
  create:      jest.fn(),
  ...overrides,
});

const validInput = {
  name:     'John Doe',
  email:    'john.doe@example.com',
  phone:    '1234567890',
  address:  '123 Main St',
  password: 'Secret@123',
};

let repo, service;

beforeEach(() => {
  repo    = makeRepo();
  service = new AuthService(repo);
  jest.clearAllMocks();
});

// ── Success path ─────────────────────────────────────────────────────────────
describe('register — success', () => {
  it('creates the user and returns the record (without passwordHash)', async () => {
    const created = { id: 1, name: validInput.name, email: validInput.email };
    repo.create.mockResolvedValue(created);

    const result = await service.register(validInput);

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(created);
    // passwordHash must never appear in the returned value
    expect(result.passwordHash).toBeUndefined();
  });

  it('hashes the password before persisting — never stores plaintext', async () => {
    repo.create.mockResolvedValue({ id: 1 });

    await service.register(validInput);

    const storedHash = repo.create.mock.calls[0][0].passwordHash;
    expect(storedHash).toBeDefined();
    expect(storedHash).not.toBe(validInput.password);
  });

  it('stores null for address when address is omitted', async () => {
    repo.create.mockResolvedValue({ id: 1 });
    const { address, ...inputWithoutAddress } = validInput;

    await service.register(inputWithoutAddress);

    expect(repo.create.mock.calls[0][0].address).toBeNull();
  });
});

// ── Conflict paths ────────────────────────────────────────────────────────────
describe('register — conflicts', () => {
  it('throws ConflictError when email is already registered', async () => {
    repo.findByEmail.mockResolvedValue({ id: 2, email: validInput.email });

    await expect(service.register(validInput)).rejects.toThrow(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('throws ConflictError when phone is already registered', async () => {
    repo.findByPhone.mockResolvedValue({ id: 3, phone: validInput.phone });

    await expect(service.register(validInput)).rejects.toThrow(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('checks email before phone — short-circuits on email conflict', async () => {
    repo.findByEmail.mockResolvedValue({ id: 2 });

    await expect(service.register(validInput)).rejects.toThrow(ConflictError);
    // Phone check should not be reached
    expect(repo.findByPhone).not.toHaveBeenCalled();
  });
});
