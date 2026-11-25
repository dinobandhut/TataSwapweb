import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc';

const rootDir = process.cwd();
const contractsDir = path.join(rootDir, 'contracts');
const outFile = path.join(rootDir, 'src', 'lib', 'contractArtifacts.ts');

const sourcePaths = [
  'TataSwapFeeManager.sol',
  'TataSwapPool.sol',
  'TataSwapFactory.sol',
  'TataSwapRouter.sol',
  'TataSwapListingFee.sol',
  'mocks/MockERC20.sol',
  'mocks/WrappedNative.sol',
];

const sources = {};
for (const rel of sourcePaths) {
  sources[rel] = {
    content: fs.readFileSync(path.join(contractsDir, rel), 'utf8'),
  };
}

function findImports(importPath) {
  const candidates = [
    path.join(contractsDir, importPath),
    path.join(rootDir, 'node_modules', importPath),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return { contents: fs.readFileSync(candidate, 'utf8') };
    }
  }
  return { error: `File not found: ${importPath}` };
}

const input = {
  language: 'Solidity',
  sources,
  settings: {
    evmVersion: 'paris',
    optimizer: {
      enabled: true,
      runs: 200,
    },
    viaIR: true,
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'],
      },
    },
  },
};

const rawOutput = solc.compile(JSON.stringify(input), { import: findImports });
const output = JSON.parse(rawOutput);

if (output.errors) {
  const fatal = output.errors.filter((e) => e.severity === 'error');
  if (fatal.length > 0) {
    console.error('Solidity compilation errors:', fatal);
    process.exit(1);
  }
  for (const warn of output.errors) {
    console.warn('[solc]', warn.formattedMessage || warn.message);
  }
}

const targets = [
  { key: 'WrappedNative', file: 'mocks/WrappedNative.sol', name: 'WrappedNative' },
  { key: 'MockERC20', file: 'mocks/MockERC20.sol', name: 'MockERC20' },
  { key: 'TataSwapFeeManager', file: 'TataSwapFeeManager.sol', name: 'TataSwapFeeManager' },
  { key: 'TataSwapFactory', file: 'TataSwapFactory.sol', name: 'TataSwapFactory' },
  { key: 'TataSwapRouter', file: 'TataSwapRouter.sol', name: 'TataSwapRouter' },
  { key: 'TataSwapListingFee', file: 'TataSwapListingFee.sol', name: 'TataSwapListingFee' },
];

const artifacts = {};
for (const t of targets) {
  const compiled = output.contracts?.[t.file]?.[t.name];
  if (!compiled?.evm?.bytecode?.object) {
    throw new Error(`Missing bytecode for ${t.file}:${t.name}`);
  }
  artifacts[t.key] = {
    abi: compiled.abi,
    bytecode: `0x${compiled.evm.bytecode.object}`,
  };
}

const tsContent = `// Auto-generated from /contracts/*.sol using solc (EVM paris, optimizer 200, viaIR)
// Do not edit manually; regenerate via: node scripts/compile-artifacts.mjs

export interface CompiledContractArtifact {
  abi: readonly Record<string, unknown>[];
  bytecode: \`0x\${string}\`;
}

export const CONTRACT_ARTIFACTS = ${JSON.stringify(artifacts, null, 2)} as const;
`;

fs.writeFileSync(outFile, tsContent, 'utf8');
console.log(
  'Generated',
  outFile,
  'for:',
  Object.keys(artifacts)
    .map((k) => `${k} (${artifacts[k].bytecode.length} chars)`)
    .join(', ')
);
