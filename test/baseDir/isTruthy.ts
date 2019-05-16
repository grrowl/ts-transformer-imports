type MaybeTruthyValue = boolean | number | object

export default (value: MaybeTruthyValue) => !!value
